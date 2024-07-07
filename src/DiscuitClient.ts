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
		return await this.request<UserData>("POST", "_login", {
			body: JSON.stringify({ username, password }),
		});
	}

	async getPost(id: string): Promise<Post> {
		const data = await this.request<PostData>("GET", `posts/${id}`);
		return new Post(data, this);
	}

	async upvotePost(id: string): Promise<Post> {
		const post: PostData = await this.request("POST", "_postVote", {
			body: JSON.stringify({
				postId: id,
				up: true,
			}),
		});

		return new Post(post, this);
	}

	async downvotePost(id: string): Promise<Post> {
		const post: PostData = await this.request("POST", "_postVote", {
			body: JSON.stringify({
				postId: id,
				up: false,
			}),
		});

		return new Post(post, this);
	}

	async deletePost(
		id: string,
		deleteAs?: string,
		deleteContent?: boolean,
	): Promise<Post> {
		const post: PostData = await this.request("DELETE", `posts/${id}`, {
			params: {
				deleteAs: deleteAs || "normal",
				deleteContent: deleteContent ? "true" : "false",
			},
		});

		return new Post(post, this);
	}

	async updatePost(id: string, title?: string, body?: string): Promise<Post> {
		const post: PostData = await this.request("PUT", `posts/${id}`, {
			body: JSON.stringify({ title, body }),
		});

		return new Post(post, this);
	}

	async comment(id: string, body: string, parentId?: string): Promise<Comment> {
		const comment: CommentData = await this.request(
			"POST",
			`posts/${id}/comments`,
			{
				body: JSON.stringify({ body, parentCommentId: parentId || null }),
			},
		);

		return new Comment(comment, this);
	}
}

export class Post {
	private client: DiscuitClient;
	public readonly data: PostData;

	constructor(data: PostData, client: DiscuitClient) {
		this.client = client;
		this.data = data;
	}

	async upvote(): Promise<Post> {
		return this.client.upvotePost(this.data.id);
	}
	async downvote(): Promise<Post> {
		return this.client.downvotePost(this.data.id);
	}
	async delete(deleteAs?: string, deleteContent?: boolean): Promise<Post> {
		return this.client.deletePost(this.data.publicId, deleteAs, deleteContent);
	}
	async edit(title?: string, body?: string): Promise<Post> {
		return this.client.updatePost(
			this.data.id,
			title ?? this.data.title,
			body ?? (this.data?.body || undefined),
		);
	}
	async comment(body: string): Promise<Comment> {
		return this.client.comment(this.data.id, body);
	}
}

export class Comment {
	private client: DiscuitClient;
	public readonly data: CommentData;

	constructor(data: CommentData, client: DiscuitClient) {
		this.client = client;
		this.data = data;
	}
}
