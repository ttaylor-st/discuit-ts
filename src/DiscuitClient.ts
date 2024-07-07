import type { CommentData, PostData, UserData } from "./types";

export interface ApiConfig {
	baseURL?: string;
}

interface RequestOptions extends RequestInit {
	params?: Record<string, string>;
}

export default class DiscuitClient {
	private csrfToken: string | null = null;
	private sid: string | null = null;
	private baseURL: string;

	constructor(config: ApiConfig) {
		this.baseURL =
			config.baseURL?.replace(/\/?$/, "/") || "http://discuit.net/api/";
	}

	private handleResponse = (response: Response): Response => {
		const cookies = response.headers.getAll("set-cookie");
		if (cookies) {
			for (const cookie of cookies) {
				if (cookie.startsWith("csrftoken="))
					this.csrfToken = cookie.split(";")[0].split("=")[1];
				else if (cookie.startsWith("SID="))
					this.sid = cookie.split(";")[0].split("=")[1];
			}
		}

		const headerCsrfToken = response.headers.get("csrf-token");
		if (headerCsrfToken) this.csrfToken = headerCsrfToken;

		return response;
	};

	private async request<T>(
		method: string,
		url: string,
		options: RequestOptions = {},
	): Promise<T> {
		const headers = new Headers(options.headers);

		if (method.toUpperCase() !== "GET" && this.csrfToken) {
			headers.set("X-Csrf-Token", this.csrfToken);
		}

		headers.set("Cookie", `SID=${this.sid}; csrftoken=${this.csrfToken}`);

		const fullUrl: URL = new URL(url, this.baseURL);
		if (options.params) {
			for (const [key, value] of Object.entries(options.params)) {
				fullUrl.searchParams.append(key, value);
			}
		}

		try {
			let response = await fetch(fullUrl.toString(), {
				method,
				...options,
				headers,
			});

			response = this.handleResponse(response);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			return data as T;
		} catch (error) {
			console.error("Request failed:", error);
			throw error;
		}
	}

	async initialize(): Promise<void> {
		const response = await this.request("GET", "_initial");
		if (!this.csrfToken || !this.sid) throw new Error("Initialization failed");
	}

	async login(username: string, password: string): Promise<UserData> {
		const data = await this.request<UserData>("POST", "_login", {
			body: JSON.stringify({ username, password }),
		});
		return data;
	}
}
