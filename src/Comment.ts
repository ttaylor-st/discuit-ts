/**
 * @file Comment.ts
 * @module Comment
 * @description Class representing a comment.
 */

import type { DiscuitClient } from "./DiscuitClient.ts";
import type { CommentData, TimeString, UserData } from "./types.ts";

/**
 * @name Comment
 * @description Represents a comment.
 */
export class Comment {
	/** The Discuit client instance. */
	private client: DiscuitClient;

	/** The ID of the comment. */
	public readonly id!: string;
	/** The ID of the post the comment belongs to. */
	public readonly postId!: string;
	/** The public ID of the post the comment belongs to. */
	public readonly postPublicId!: string;

	/** The ID of the community in which this comment was made. */
	public readonly communityId!: string;
	/** The name of the community in which this comment was made. */
	public readonly communityName!: string;

	/** The ID of the user that made the comment. */
	public readonly userId?: string;
	/** The username of the user that made the comment. */
	public readonly username!: string;
	/** The ID of the Ghost user in case the author deleted their account, otherwise undefined. */
	public readonly userGhostId?: string;
	/** The capacity in which the comment was created. */
	public readonly userGroup!: "normal" | "admins" | "mods";
	/** Indicates whether the author account is deleted */
	public readonly userDeleted!: boolean;

	/** The comment ID of the parent comment if it exists, otherwise null if this is a top-level comment. */
	public readonly parentId!: string | null;
	/** How far deep into a comment chain this comment is. Top-level comments have a depth of 0. */
	public readonly depth!: number;
	/** The total number of replies the comment has, including all deeper comments. */
	public readonly noReplies!: number;
	/** The number of direct replies the comment has. This does not include replies deeper than 1 more than the comment itself. */
	public readonly noRepliesDirect!: number;
	/** The comment IDs of all ancestor comments starting from the top-most comment. */
	public readonly ancestors!: string[] | null;

	/** The body of the comment. */
	public readonly body!: string;
	/** The number of upvotes that the comment has. */
	public readonly upvotes!: number;
	/** The number of downvotes that the comment has. */
	public readonly downvotes!: number;
	/** The time at which the comment was created. */
	public readonly createdAt!: TimeString;
	/** If the comment was edited, the time at which it was last edited, otherwise null. */
	public readonly editedAt!: TimeString | null;

	/** If the content of the comment was deleted, otherwise undefined. */
	public readonly contentStripped?: boolean;
	/** If the comment was deleted. */
	public readonly deleted!: boolean;
	/** If the comment was deleted, the time at which it was deleted, otherwise null. */
	public readonly deletedAt!: TimeString | null;
	/** If the comment was deleted, in what capacity it was deleted, otherwise undefined. */
	public readonly deletedAs?: "normal" | "admins" | "mods";

	/** The User object of the author of the comment. */
	public readonly author!: UserData;
	/** Whether the author is muted by the authenticated user. If not authenticated, this is undefined. */
	public readonly isAuthorMuted?: boolean;

	/** Indicated whether the authenticated user has voted. If not authenticated, this is null. */
	public readonly userVoted!: boolean | null;
	/** Indicates whether the authenticated user's vote is an upvote. If not authenticated, this is null. */
	public readonly userVotedUp!: boolean | null;

	/** The title of the post the comment belongs to. */
	public readonly postTitle?: string;
	/** Indicates whether the post the comment belongs to is deleted. */
	public readonly postDeleted!: boolean;
	/** If the post is deleted, in what capacity, otherwise undefined. */
	public readonly postDeletedAs?: "normal" | "admins" | "mods";

	/**
	 * @name constructor
	 * @description Creates a new instance of the Comment class.
	 * @param {CommentData} data The data for the comment.
	 * @param {DiscuitClient} client The Discuit client instance.
	 */
	constructor(data: CommentData, client: DiscuitClient) {
		this.client = client;

		Object.assign(this, data);
	}

	/**
	 * @name upvote
	 * @description Upvotes a comment.
	 * @returns {Promise<Comment>} A promise that resolves to the upvoted comment.
	 * @async
	 */
	async upvote(): Promise<Comment> {
		const comment = await this.client.upvoteComment(this.id);
		Object.assign(this, comment);
		return this;
	}
	/**
	 * @name downvote
	 * @description Downvotes a comment.
	 * @returns {Promise<Comment>} A promise that resolves to the downvoted comment.
	 * @async
	 */
	async downvote(): Promise<Comment> {
		const comment = await this.client.downvoteComment(this.id);
		Object.assign(this, comment);
		return this;
	}
	/**
	 * @name delete
	 * @description Deletes a comment.
	 * @param {string} [deleteAs] - The identifier of the user who wants to perform the delete action, either "normal",
	 * 	"moderator", or "admin".
	 * @returns {Promise<Comment>} - Promise that resolves with the deleted comment.
	 * @async
	 */
	async delete(deleteAs?: string): Promise<Comment> {
		const comment = await this.client.deleteComment(
			this.postId,
			this.id,
			deleteAs,
		);
		Object.assign(this, comment);
		return this;
	}
	/**
	 * @name edit
	 * @description Edits the comment with a new body.
	 * @param {string} body - The new body for the comment.
	 * @returns {Promise<Comment>} - A promise that resolves to the updated comment.
	 * @async
	 */
	async edit(body: string): Promise<Comment> {
		const comment = await this.client.updateComment(
			this.postPublicId,
			body,
			this.id,
		);
		Object.assign(this, comment);
		return this;
	}
	/**
	 * @name comment
	 * @description Replies to the comment.
	 * @param {string} body - The body of the comment.
	 * @returns {Promise<Comment>} A promise that resolves to the posted comment object.
	 * @async
	 */
	async comment(body: string): Promise<Comment> {
		return await this.client.comment(this.postPublicId, body, this.id);
	}
}
