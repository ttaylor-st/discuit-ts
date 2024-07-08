import { Comment } from "./Comment";
import { Post } from "./Post";
import type {
	CommentData,
	InitialResponseData,
	ModeratorFeedResponse,
	NormalFeedResponse,
	PostData,
	UserData,
} from "./types";

export interface ApiConfig {
	baseURL?: string;
}

interface RequestOptions extends RequestInit {
	params?: Record<string, string>;
}

// noinspection JSUnusedGlobalSymbols
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

	createPostInstances(postDataArray: PostData[]): Post[] {
		return postDataArray.map((postData) => new Post(postData, this));
	}

	/**
	 * @name getPosts
	 * @description Fetches posts from the API.
	 * @returns
	 */
	async getPosts(options?: {
		/** The type of feed to fetch. */
		feed?: "home" | "all" | "community";
		/** The sort order of the feed. */
		sort?:
			| "latest"
			| "hot"
			| "activity"
			| "day"
			| "week"
			| "month"
			| "year"
			| "all";
		/** The filter to apply to the feed. */
		filter?: "all" | "deleted" | "locked";
		/** The ID of the community to fetch posts from. */
		communityId?: string;
		/** The next page token. */
		next?: string;
		/** The maximum number of posts to fetch. */
		limit?: number;
	}): Promise<NormalFeedResponse | ModeratorFeedResponse> {
		const params: Record<string, string> = {};

		params.feed = options?.feed || "home";
		params.sort = options?.sort || "latest";

		if (options?.filter) params.filter = options.filter;
		if (options?.communityId) params.communityId = options.communityId;
		if (options?.next) params.next = options.next;
		if (options?.limit) params.limit = options.limit.toString();
		else params.limit = "10";

		return this.request<NormalFeedResponse | ModeratorFeedResponse>(
			"GET",
			"posts",
			{ params },
		);
	}

	/**
	 * @name newPost
	 * @description Creates a new post.
	 * @returns {Promise<Post>} A promise that resolves with the new post.
	 * @async
	 */
	async newPost(data: {
		/** The type of post to create. */
		type: "text" | "image" | "link";
		/** The title of the post. */
		title: string;
		/** The name of the community to post in. */
		community: string;
		/** The content of the post. Only required for text posts. */
		body?: string;
		/** The link of the post. Only required for link posts. */
		link?: string;
		/** The path to the image. Only required for image posts. */
		image?: string;
	}): Promise<Post> {
		if (data.type === "link" && !data.link)
			throw new Error("Link is required for link posts.");
		if (data.type === "image" && !data.image)
			throw new Error("Image is required for image posts.");

		const post: PostData = await this.request("POST", "posts", {
			body: JSON.stringify({ ...data }),
		});

		return new Post(post, this);
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

	/**
	 * @name upvoteComment
	 * @description Upvotes a comment.
	 * @param {string} id The ID of the comment.
	 * @async
	 */
	async upvoteComment(id: string): Promise<Comment> {
		const comment: CommentData = await this.request("POST", "_commentVote", {
			body: JSON.stringify({
				commentId: id,
				up: true,
			}),
		});

		return new Comment(comment, this);
	}

	/**
	 * @name downvoteComment
	 * @description Downvotes a comment.
	 * @param {string} id The ID of the comment.
	 * @async
	 */
	async downvoteComment(id: string): Promise<Comment> {
		const comment: CommentData = await this.request("POST", "_commentVote", {
			body: JSON.stringify({
				commentId: id,
				up: false,
			}),
		});

		return new Comment(comment, this);
	}

	/**
	 * @name deleteComment
	 * @description Deletes a comment.
	 * @param {string} postId The ID of the post.
	 * @param {string} id The public ID of the comment.
	 * @param {string} deleteAs The type of deletion, either "normal", "moderator", or "admin".
	 * @async
	 */
	async deleteComment(
		postId: string,
		id: string,
		deleteAs?: string,
	): Promise<Comment> {
		const comment: CommentData = await this.request(
			"DELETE",
			`posts/${postId}/comments/${id}`,
			{
				params: {
					deleteAs: deleteAs || "normal",
				},
			},
		);

		return new Comment(comment, this);
	}

	/**
	 * @name updateComment
	 * @description Updates a comment.
	 * @param {string} postId The ID of the post.
	 * @param {string} body The new body of the comment.
	 * @param {string} id The public ID of the comment.
	 * @async
	 */
	async updateComment(
		postId: string,
		body: string,
		id: string,
	): Promise<Comment> {
		const comment: CommentData = await this.request(
			"PUT",
			`posts/${postId}/comments/${id}`,
			{
				body: JSON.stringify({ body }),
			},
		);

		return new Comment(comment, this);
	}
}

export { DiscuitClient };
