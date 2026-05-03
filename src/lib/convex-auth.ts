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
	return Boolean(localStorage.getItem(AUTH_REFRESH_TOKEN_KEY));
}

export function getStoredAuthToken() {
	if (!canUseStorage()) return null;
	return localStorage.getItem(AUTH_TOKEN_KEY);
}

function getStoredRefreshToken() {
	if (!canUseStorage()) return null;
	return localStorage.getItem(AUTH_REFRESH_TOKEN_KEY);
}

export function applyStoredAuth(client: ConvexClient) {
	client.setAuth(async () => getStoredAuthToken());
}

function storeTokens(tokens: AuthTokens) {
	if (canUseStorage()) {
		localStorage.setItem(AUTH_TOKEN_KEY, tokens.token);
		localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, tokens.refreshToken);
	}
}

export function applyFreshAuth(client: ConvexClient, tokens: AuthTokens) {
	storeTokens(tokens);
	client.setAuth(async () => tokens.token);
}

export function clearAuthSession(client?: ConvexClient) {
	if (canUseStorage()) {
		localStorage.removeItem(AUTH_TOKEN_KEY);
		localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
	}

	client?.setAuth(async () => null);
}

async function runPasswordAuth(
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

export async function signInWithPassword(client: ConvexClient, email: string, password: string) {
	const result = await runPasswordAuth(client, 'signIn', email.trim(), password);
	if (!result.tokens) {
		throw new Error('Sign in did not finish. Please try again.');
	}

	applyFreshAuth(client, result.tokens);
	return result;
}

export async function signUpWithPassword(client: ConvexClient, email: string, password: string) {
	const result = await runPasswordAuth(client, 'signUp', email.trim(), password);
	if (!result.tokens) {
		throw new Error('Account creation did not finish. Please try again.');
	}

	applyFreshAuth(client, result.tokens);
	return result;
}

export async function restoreAuthSession(client: ConvexClient) {
	const refreshToken = getStoredRefreshToken();
	if (!refreshToken) {
		clearAuthSession(client);
		return false;
	}

	applyStoredAuth(client);

	try {
		const result = (await client.action(api.auth.signIn, {
			refreshToken
		})) as AuthActionResult;

		if (!result.tokens) {
			clearAuthSession(client);
			return false;
		}

		applyFreshAuth(client, result.tokens);
		return true;
	} catch {
		clearAuthSession(client);
		return false;
	}
}

export async function signOut(client: ConvexClient) {
	try {
		if (hasStoredAuthSession()) {
			await client.action(api.auth.signOut, {});
		}
	} finally {
		clearAuthSession(client);
	}
}
