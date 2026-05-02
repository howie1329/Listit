import { getStoredAuthToken } from '$lib/convex-auth';

export async function postAppApi<T>(path: string, body?: Record<string, unknown>) {
	const token = getStoredAuthToken();
	if (!token) {
		throw new Error('Sign in before using this action.');
	}

	const response = await fetch(path, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			...(body ? { 'Content-Type': 'application/json' } : {})
		},
		body: body ? JSON.stringify(body) : undefined
	});

	const data = (await response.json().catch(() => ({}))) as { error?: string };
	if (!response.ok) {
		throw new Error(data.error ?? 'Request failed.');
	}

	return data as T;
}
