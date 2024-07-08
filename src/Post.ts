import { Comment } from "./Comment";
import type { DiscuitClient } from "./DiscuitClient";
import type {
	CommunityData,
	ImageData,
	PostData,
	TimeString,
	UserData,
} from "./types";

// noinspection JSUnusedGlobalSymbols
/**
 * @name Post
 * @description Class representing a post.
 */
export class Post {
	/** The client that created this post. */
	private client: DiscuitClient;

	/** The ID of the post */
	public id!: string;
	/** The type of post */
	public type!: "text" | "image" | "link";
	/** The value in https://discuit.net/gaming/post/{publicId} */
	public publicId!: string;

	/** ID of the author. */
	public userId!: string;
	/** Username of the author. */
	public username!: string;
	/** The ID of the Ghost user in case the user deleted their account */
	public userGhostId?: string;
	/** In what capacity the post was created. For "speaking officially" as a mod or an admin. */
	public userGroup!: "normal" | "admins" | "mods";
	/** Indicated whether the author's account is deleted */
	public userDeleted!: boolean;

	/** If the post is pinned in the community */
	public isPinned!: boolean;
	/** If the post is pinned site-wide */
	public isPinnedSite!: boolean;

	/** The ID of the community the post is posted in */
	public communityId!: string;
	/** The name of that community */
	public communityName!: string;
	/** The profile picture of that community */
	public communityProPic!: ImageData;
	/** The banner image of that community */
	public communityBannerImage!: ImageData;

	/** Greater than 3 characters */
	public title!: string;
	/** Body of the post (only valid for text posts, null otherwise) */
	public body!: string | null;
	/** The posted image (only valid for image posts, null otherwise) */
	public image!: ImageData | null;
	/** The URL of the link. */
	public link:
		| {
				url: string;
				/** The hostname of the link. For a URL of "https://discuit.net", this would be "discuit.net". */
				hostname: string;
				/** The image object of the OpenGraph image on the site. If no OpenGraph image was found, this is null. */
				image: ImageData | null;
		  }
		| undefined;

	/** If the post was locked */
	public locked!: boolean;
	/** Who locked the post. */
	public lockedBy!: string | null;
	/** In what capacity the post was locked, undefined if the post is not locked */
	public lockedByGroup!: "owner" | "admins" | "mods" | undefined;
	/** Time at which the post was locked, null if the post is not locked */
	public lockedAt!: TimeString | null;

	/** The number of upvotes the post has */
	public upvotes!: number;
	/** The number of downvotes the post has */
	public downvotes!: number;
	/** For ordering posts by 'hot' */
	public hotness!: number;

	/** The time when the post was created */
	public createdAt!: TimeString;
	/** Last edited time. */
	public editedAt!: TimeString | null;
	/** Either the post created time or, if there are comments on the post, the time the most recent comment was created at. */
	public lastActivityAt!: TimeString;

	/** If the post was deleted */
	public deleted!: boolean;
	/** Time at which the post was deleted, null if the post has not been deleted */
	public deletedAt!: TimeString | null;
	/** ID of the user who deleted the post. */
	public deletedBy!: string | null;
	/** In what capacity the post was deleted, undefined if the post is not deleted */
	public deletedAs!: "normal" | "admins" | "mods" | undefined;
	/** If true, the body of the post and all associated links or images are deleted. */
	public deletedContent!: boolean;
	/** In what capacity the content was deleted, undefined if the content has not been deleted. */
	public deletedContentAs: "normal" | "admins" | "mods" | undefined;

	/** Comment count. */
	public noComments!: number;
	/** Comments of the post. */
	public comments: Comment[] | undefined;
	/** Pagination cursor for comments. */
	public commentsNext!: string | null;

	/** Indicated whether the authenticated user has voted. If not authenticated, the value is null. */
	public userVoted!: boolean | null;
	/** Indicates whether the authenticated user's vote is an upvote. */
	public userVotedUp!: boolean | null;

	/** If the author of the post has been muted by the logged in user. */
	public isAuthorMuted!: boolean;
	/** If the community that the post is in has been muted by the logged in user. */
	public isCommunityMuted!: boolean;

	/** The Community object of the community that the post is in. */
	public community!: CommunityData | undefined;
	/** The User object of the author of the post. */
	public author!: UserData;

	/**
	 * Creates a new instance of the Post class.
	 *
	 * @param {PostData} data - The data for the post.
	 * @param {DiscuitClient} client - The Discuit client instance.
	 */
	constructor(data: PostData, client: DiscuitClient) {
		this.client = client;

		Object.assign(this, data);

		if (data.comments) {
			this.comments = data.comments.map(
				(commentData) => new Comment(commentData, client),
			);
		}
	}

	/**
	 * @description Upvotes a post.
	 * @returns {Promise<Post>} A promise that resolves to the upvoted post.
	 * @async
	 */
	async upvote(): Promise<Post> {
		return this.client.upvotePost(this.id);
	}
	/**
	 * @description Downvotes a post.
	 * @return {Promise<Post>} A Promise that resolves with the downvoted post.
	 * @async
	 */
	async downvote(): Promise<Post> {
		return this.client.downvotePost(this.id);
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
		return this.client.deletePost(this.publicId, deleteAs, deleteContent);
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
			this.id,
			title ?? this.title,
			body ?? (this.body || undefined),
		);
	}
	/**
	 * @description Posts a comment on the post.
	 * @param {string} body - The body of the comment.
	 * @returns {Promise<Comment>} A promise that resolves to the posted comment object.
	 * @async
	 */
	async comment(body: string): Promise<Comment> {
		return this.client.comment(this.publicId, body);
	}
}
