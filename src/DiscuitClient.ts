import type {
	CommentData,
	InitialResponseData,
	PostData,
	UserData,
} from "./types";

export interface ApiConfig {
	baseURL?: string;
}

interface RequestOptions extends RequestInit {
	params?: Record<string, string>;
}

/**
 * @name DiscuitClient
 * @description The main class for interacting with the Discuit API.
 */
class DiscuitClient {
	private csrfToken: string | null = null;
	private sid: string | null = null;
	private readonly baseURL: string;

	/**
	 * @description Creates a new instance of the DiscuitClient.
	 * @param {ApiConfig} config The configuration for the client.
	 */
	constructor(config: ApiConfig) {
		this.baseURL =
			config.baseURL?.replace(/\/?$/, "/") || "http://discuit.net/api/";
	}

	/**
	 * @name handleResponse
	 * @description Extracts the CSRF token and SID from the response headers and stores them in the client.
	 * @param {Response} response - The response received from the API request.
	 * @returns {Response} - The updated response.
	 * @private
	 */
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

	/**
	 * @description Makes a request to the API.
	 * @param {string} method - The HTTP method for the request.
	 * @param {string} url - The URL for the request.
	 * @param {Object} options - Additional options for the request.
	 * @returns {Promise<T>} - A Promise that resolves to the response data of type T.
	 * @private
	 * @async
	 */
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

	/**
	 * @description Fetches the initial data from the API.
	 * @return {Promise<InitialResponseData>} A promise that resolves with the initial response data.
	 * @throws {Error} If initialization fails due to missing csrfToken or sid.
	 * @async
	 */
	async initialize(): Promise<InitialResponseData> {
		const response: InitialResponseData = await this.request("GET", "_initial");
		if (!this.csrfToken || !this.sid) throw new Error("Initialization failed");
		return response;
	}

	/**
	 * @name login
	 * @description Logs in to the API.
	 * @param {string} username The username to log in with.
	 * @param {string} password The password to log in with.
	 * @async
	 */
	async login(username: string, password: string): Promise<UserData> {
		return await this.request<UserData>("POST", "_login", {
			body: JSON.stringify({ username, password }),
		});
	}

	/**
	 * @name getPost
	 * @description Gets a post from the API using its public ID.
	 * @param {string} id The public ID of the post.
	 * @async
	 */
	async getPost(id: string): Promise<Post> {
		const data = await this.request<PostData>("GET", `posts/${id}`);
		return new Post(data, this);
	}

	/**
	 * @name upvotePost
	 * @description Upvotes a post.
	 * @param {string} id The ID of the post.
	 * @async
	 */
	async upvotePost(id: string): Promise<Post> {
		const post: PostData = await this.request("POST", "_postVote", {
			body: JSON.stringify({
				postId: id,
				up: true,
			}),
		});

		return new Post(post, this);
	}

	/**
	 * @name downvotePost
	 * @description Downvotes a post.
	 * @param {string} id The ID of the post.
	 * @async
	 */
	async downvotePost(id: string): Promise<Post> {
		const post: PostData = await this.request("POST", "_postVote", {
			body: JSON.stringify({
				postId: id,
				up: false,
			}),
		});

		return new Post(post, this);
	}

	/**
	 * @name deletePost
	 * @description Deletes a post.
	 * @param {string} id The public ID of the post.
	 * @param {string} deleteAs The type of deletion, either "normal", "moderator", or "admin".
	 * @param {boolean} deleteContent Whether to delete the content of the post.
	 * @async
	 */
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

	/**
	 * @name updatePost
	 * @description Updates a post.
	 * @param {string} id The public ID of the post.
	 * @param {string} title The new title of the post.
	 * @param {string} body The new body of the post.
	 * @async
	 */
	async updatePost(id: string, title?: string, body?: string): Promise<Post> {
		const post: PostData = await this.request("PUT", `posts/${id}`, {
			body: JSON.stringify({ title, body }),
		});

		return new Post(post, this);
	}

	/**
	 * @name comment
	 * @description Comments on a post.
	 * @param {string} id The public ID of the post.
	 * @param {string} body The body of the comment.
	 * @param {string} parentId The ID of the parent comment, if any.
	 * @async
	 */
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

/**
 * @name Post
 * @description Class representing a post.
 */
class Post {
	/** The client that created this post. */
	private client: DiscuitClient;
	/** The data of the post. */
	public readonly data: PostData;

	/**
	 * Creates a new instance of the Post class.
	 *
	 * @param {PostData} data - The data for the post.
	 * @param {DiscuitClient} client - The Discuit client instance.
	 */
	constructor(data: PostData, client: DiscuitClient) {
		this.client = client;
		this.data = data;
	}

	/**
	 * @description Upvotes a post.
	 * @returns {Promise<Post>} A promise that resolves to the upvoted post.
	 * @async
	 */
	async upvote(): Promise<Post> {
		return this.client.upvotePost(this.data.id);
	}
	/**
	 * @description Downvotes a post.
	 * @return {Promise<Post>} A Promise that resolves with the downvoted post.
	 * @async
	 */
	async downvote(): Promise<Post> {
		return this.client.downvotePost(this.data.id);
	}
	/**
	 * @description Deletes a post.
	 * @param {string} [deleteAs] - The identifier of the user who wants to perform the delete action, either "normal",
	 * 	"moderator", or "admin".
	 * @param {boolean} [deleteContent] - True if the content of the post should also be deleted, false otherwise.
	 * @returns {Promise<Post>} - Promise that resolves with the deleted post.
	 * @async
	 */
	async delete(deleteAs?: string, deleteContent?: boolean): Promise<Post> {
		return this.client.deletePost(this.data.publicId, deleteAs, deleteContent);
	}
	/**
	 * @description Edits the post with a new title and body.
	 * @param {string} [title] - The new title for the post. If not provided, the current title will be used.
	 * @param {string} [body] - The new body for the post. If not provided, the current body will be used.
	 * @returns {Promise<Post>} - A promise that resolves to the updated post.
	 * @async
	 */
	async edit(title?: string, body?: string): Promise<Post> {
		return this.client.updatePost(
			this.data.id,
			title ?? this.data.title,
			body ?? (this.data?.body || undefined),
		);
	}
	/**
	 * @description Posts a comment on the post.
	 * @param {string} body - The body of the comment.
	 * @returns {Promise<Comment>} A promise that resolves to the posted comment object.
	 * @async
	 */
	async comment(body: string): Promise<Comment> {
		return this.client.comment(this.data.id, body);
	}
}

/**
 * Represents a comment.
 */
class Comment {
	private client: DiscuitClient;
	public readonly data: CommentData;

	/**
	 * Creates a new instance of the Comment class.
	 * @param {CommentData} data The data for the comment.
	 * @param {DiscuitClient} client The Discuit client instance.
	 */
	constructor(data: CommentData, client: DiscuitClient) {
		this.client = client;
		this.data = data;
	}
}

export { DiscuitClient, Post, Comment };
