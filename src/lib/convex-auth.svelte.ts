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

function readStoredToken() {
	if (!canUseStorage()) return null;
	return localStorage.getItem(AUTH_TOKEN_KEY);
}

function readStoredRefreshToken() {
	if (!canUseStorage()) return null;
	return localStorage.getItem(AUTH_REFRESH_TOKEN_KEY);
}

function writeStoredTokens(tokens: AuthTokens) {
	if (!canUseStorage()) return;
	localStorage.setItem(AUTH_TOKEN_KEY, tokens.token);
	localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, tokens.refreshToken);
}

function clearStoredTokens() {
	if (!canUseStorage()) return;
	localStorage.removeItem(AUTH_TOKEN_KEY);
	localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
}

class ConvexAuthController {
	private client = $state<ConvexClient | null>(null);
	private storageListener = $state<((event: StorageEvent) => void) | null>(null);

	isLoading = $state(true);
	isAuthenticated = $state(false);
	token = $state<string | null>(null);

	initAuth(client: ConvexClient | null) {
		if (this.client === client && (client === null || this.storageListener !== null)) {
			return;
		}

		this.teardownStorageSync();
		this.client = client;

		if (!client) {
			this.token = null;
			this.isAuthenticated = false;
			this.isLoading = false;
			return;
		}

		this.token = readStoredToken();
		this.isAuthenticated = this.token !== null;
		client.setAuth(async () => this.token);
		this.isLoading = false;
		this.setupStorageSync(client);
	}

	getAuthToken() {
		return this.token;
	}

	hasSession() {
		return this.isAuthenticated;
	}

	async signIn(client: ConvexClient, email: string, password: string) {
		const result = (await client.action(api.auth.signIn, {
			provider: 'password',
			params: { flow: 'signIn' satisfies PasswordFlow, email, password }
		})) as AuthActionResult;

		if (result.tokens) {
			this.applyTokens(client, result.tokens);
		}

		return result;
	}

	async signUp(client: ConvexClient, email: string, password: string) {
		const result = (await client.action(api.auth.signIn, {
			provider: 'password',
			params: { flow: 'signUp' satisfies PasswordFlow, email, password }
		})) as AuthActionResult;

		if (result.tokens) {
			this.applyTokens(client, result.tokens);
		}

		return result;
	}

	async signOut() {
		try {
			if (this.client) {
				await this.client.action(api.auth.signOut, {});
			}
		} finally {
			this.clearSession();
		}
	}

	private applyTokens(client: ConvexClient, tokens: AuthTokens) {
		this.client = client;
		this.token = tokens.token;
		this.isAuthenticated = true;
		this.isLoading = false;
		writeStoredTokens(tokens);
		client.setAuth(async () => this.token);
	}

	private clearSession() {
		this.token = null;
		this.isAuthenticated = false;
		this.isLoading = false;
		clearStoredTokens();
		this.client?.setAuth(async () => null);
	}

	private setupStorageSync(client: ConvexClient) {
		if (typeof window === 'undefined') return;

		this.storageListener = (event: StorageEvent) => {
			if (event.storageArea !== localStorage) return;
			if (event.key !== AUTH_TOKEN_KEY && event.key !== AUTH_REFRESH_TOKEN_KEY) return;

			const token = readStoredToken();
			const refreshToken = readStoredRefreshToken();
			this.token = token;
			this.isAuthenticated = token !== null;

			if (token && refreshToken) {
				client.setAuth(async () => this.token);
				return;
			}

			clearStoredTokens();
			client.setAuth(async () => null);
		};

		window.addEventListener('storage', this.storageListener);
	}

	private teardownStorageSync() {
		if (typeof window === 'undefined' || !this.storageListener) return;
		window.removeEventListener('storage', this.storageListener);
		this.storageListener = null;
	}
}

export const convexAuth = new ConvexAuthController();
