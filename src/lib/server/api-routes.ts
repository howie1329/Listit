import { ConvexHttpClient } from 'convex/browser';
import { error, json, type RequestEvent } from '@sveltejs/kit';
import { VITE_CONVEX_URL } from '$env/static/private';

import { api } from '../../convex/_generated/api';

export function requireBearerToken(request: Request) {
	const header = request.headers.get('authorization');
	const match = header?.match(/^Bearer\s+(.+)$/i);
	if (!match) {
		error(401, 'Authentication required');
	}
	return match[1];
}

export function authedConvex(request: Request) {
	if (!VITE_CONVEX_URL) {
		error(500, 'VITE_CONVEX_URL is not configured');
	}

	const client = new ConvexHttpClient(VITE_CONVEX_URL);
	client.setAuth(requireBearerToken(request));
	return client;
}

export async function readJsonObject(request: Request) {
	if (!request.body) return {};

	const body = (await request.json().catch(() => {
		error(400, 'Request body must be valid JSON');
	})) as unknown;

	if (!body || typeof body !== 'object' || Array.isArray(body)) {
		error(400, 'Request body must be a JSON object');
	}

	return body as Record<string, unknown>;
}

export function requireString(value: unknown, name: string) {
	if (typeof value !== 'string' || !value.trim()) {
		error(400, `${name} is required`);
	}
	return value.trim();
}

export async function runApiAction<T>(event: RequestEvent, action: () => Promise<T>) {
	try {
		return json(await action());
	} catch (caught) {
		const message = caught instanceof Error ? caught.message : 'Request failed';
		const status =
			message.includes('Authentication required') || message.includes('Not authenticated')
				? 401
				: message.includes('not found')
					? 404
					: message.includes('required') ||
						  message.includes('disabled') ||
						  message.includes('must be enriched')
						? 400
						: 500;

		return json({ error: message }, { status });
	}
}

export { api };
