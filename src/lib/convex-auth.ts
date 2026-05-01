import type { ConvexClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';

const AUTH_TOKEN_KEY = 'listit-auth-token';
const AUTH_REFRESH_TOKEN_KEY = 'listit-auth-refresh-token';

type PasswordFlow = 'signIn' | 'signUp';

type AuthTokens = {
	token: string;
	refreshToken: string;
};

type AuthActionResult = {
	tokens?: AuthTokens | null;
	redirect?: string;
	verifier?: string;
};

function canUseStorage() {
	return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export function hasStoredAuthSession() {
	if (!canUseStorage()) return false;
	return Boolean(localStorage.getItem(AUTH_TOKEN_KEY));
}

export function getStoredAuthToken() {
	if (!canUseStorage()) return null;
	return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function applyStoredAuth(client: ConvexClient) {
	client.setAuth(async () => getStoredAuthToken());
}

export function applyFreshAuth(client: ConvexClient, tokens: AuthTokens) {
	if (canUseStorage()) {
		localStorage.setItem(AUTH_TOKEN_KEY, tokens.token);
		localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, tokens.refreshToken);
	}

	client.setAuth(async () => tokens.token);
}

export async function runPasswordAuth(
	client: ConvexClient,
	flow: PasswordFlow,
	email: string,
	password: string
) {
	return (await client.action(api.auth.signIn, {
		provider: 'password',
		params: { flow, email, password }
	})) as AuthActionResult;
}
