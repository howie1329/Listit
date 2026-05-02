import { convexAuth } from '$lib/convex-auth.svelte';

export async function postAppApi<T>(path: string, body?: Record<string, unknown>) {
	const token = convexAuth.getAuthToken();
	if (!token) {
		throw new Error('Authentication required');
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
