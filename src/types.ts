/**
 * Represents a time value in RFC 3339 format with sub-second precision.
 */
export type TimeString = string;

/**
 * @name InitialResponse
 * @description The response from the initial request to the server.
 */
export type InitialResponseData = {
	reportReasons: ReportReasonData[];
	user: UserData | null;
	communities: CommunityData[];
	noUsers: number;
	bannedFrom: string[] | null;
	vapidPublicKey: string;
	mutes: {
		communityMutes: MuteData[];
		userMutes: MuteData[];
	};
};

/**
 * Represents a comment in the Discuit API.
 */
export type CommentData = {
	/** The ID of the comment. */
	id: string;
	/** The ID of the post the comment belongs to. */
	postId: string;
	/** The public ID of the post the comment belongs to. */
	postPublicId: string;

	/** The ID of the community in which this comment was made. */
	communityId: string;
	/** The name of the community in which this comment was made. */
	communityName: string;

	/** The ID of the user that made the comment. */
	userId?: string;
	/** The username of the user that made the comment. */
	username: string;
	/** The ID of the Ghost user in case the author deleted their account, otherwise undefined. */
	userGhostId?: string;
	/** The capacity in which the comment was created. */
	userGroup: "normal" | "admins" | "mods";
	/** Indicates whether the author account is deleted */
	userDeleted: boolean;

	/** The comment ID of the parent comment if it exists, otherwise null if this is a top-level comment. */
	parentId: string | null;
	/** How far deep into a comment chain this comment is. Top-level comments have a depth of 0. */
	depth: number;
	/** The total number of replies the comment has, including all deeper comments. */
	noReplies: number;
	/** The number of direct replies the comment has. This does not include replies deeper than 1 more than the comment itself. */
	noDirectReplies: number;
	/** The comment IDs of all ancestor comments starting from the top-most comment. */
	ancestors: string[] | null;

	/** The body of the comment. */
	body: string;
	/** The number of upvotes that the comment has. */
	upvotes: number;
	/** The number of downvotes that the comment has. */
	downvotes: number;
	/** The time at which the comment was created. */
	createdAt: TimeString;
	/** If the comment was edited, the time at which it was last edited, otherwise null. */
	editedAt: TimeString | null;

	/** If the content of the comment was deleted, otherwise undefined. */
	contentStripped?: boolean;
	/** If the comment was deleted. */
	deleted: boolean;
	/** If the comment was deleted, the time at which it was deleted, otherwise null. */
	deletedAt: TimeString | null;
	/** If the comment was deleted, in what capacity it was deleted, otherwise undefined. */
	deletedAs?: "normal" | "admins" | "mods";

	/** The User object of the author of the comment. */
	author: UserData;
	/** Whether the author is muted by the authenticated user. If not authenticated, this is undefined. */
	isAuthorMuted?: boolean;

	/** Indicated whether the authenticated user has voted. If not authenticated, this is null. */
	userVoted: boolean | null;
	/** Indicates whether the authenticated user's vote is an upvote. If not authenticated, this is null. */
	userVotedUp: boolean | null;

	/** The title of the post the comment belongs to. */
	postTitle?: string;
	/** Indicates whether the post the comment belongs to is deleted. */
	postDeleted: boolean;
	/** If the post is deleted, in what capacity, otherwise undefined. */
	postDeletedAs?: "normal" | "admins" | "mods";
};

/**
 * Represents a community in the Discuit API.
 */
export type CommunityData = {
	/** The ID of the community. */
	id: string;
	/** ID of the user who created the community. */
	userId: string;

	/** The name of the community. */
	name: string;
	/** If the community hosts NSFW content. */
	nsfw: boolean;
	/** The description of the community, null if no description was set. Maximum 2000 characters. */
	about: string | null;

	/** The number of members of the community. */
	noMembers: number;

	/** The community icon. */
	proPic: ImageData;
	/** The community banner image. */
	bannerImage: ImageData;

	/** The time at which the community was created. */
	createdAt: TimeString;
	/** If the community was deleted, the time at which it was deleted, otherwise null. */
	deletedAt: TimeString | null;

	/** If the community is a default community, only returned if the default communities are requested. */
	isDefault?: boolean;

	/** Indicates whether the authenticated user is a member. If not authenticated, this is null. */
	userJoined: boolean | null;
	/** Indicates whether the authenticated user is a moderator. If not authenticated, this is null. */
	userMod: boolean;

	/** The User objects of all of the moderators of the community. */
	mods: UserData[];
	/** The list of community rules. The list is empty if there are no rules. */
	rules: CommunityRuleData[];

	/** Only visible to moderators of the community, otherwise null. */
	ReportDetails: {
		/** The total number of reports. */
		noReports: number;
		/** The total number of posts reported. */
		noPostReports: number;
		/** The total number of comments reported. */
		noCommentReports: number;
	} | null;
};

/**
 * Represents a rule for a community in the Discuit API.
 */
export type CommunityRuleData = {
	/** The ID of the community rule. */
	id: number;

	/** The title of the rule. */
	rule: string;
	/** The description of the rule. If no description was set, this is null. */
	description: string | null;

	/** The ID of the community in which this is a rule. */
	communityId: string;
	/** The index of the rule. A smaller value means that the rule is closer to the top. */
	zIndex: number;

	/** The ID of the user that created the rule. */
	createdBy: string;
	/** The time at which the rule was created. */
	createdAt: TimeString;
};

/**
 * Represents an image in the Discuit API.
 */
export type ImageData = {
	/** The ID of the image. */
	id: string;

	/** The image format. */
	format: "jpeg" | "webp" | "png";
	/** The image MIME Type, eg. "image/jpeg". */
	mimetype: string;

	/** The image width. */
	width: number;
	/** The image height. */
	height: number;
	/** The size of the image in bytes. */
	size: number;

	/** The average color of the image. */
	averageColor: string;

	/** A link to the image. The path is not prefixed with /api. */
	url: string;
	/** A list of copies of the image in different sizes. */
	copies: ImageCopyData[];
};

/**
 * Represents a copy of an image in the Discuit API.
 */
export type ImageCopyData = {
	/** The name of the image copy, used to identify it. */
	name?: string;

	/** The width of the image copy. */
	width: number;
	/** The height of the image copy. */
	height: number;
	/** The width of the box that the image fits into. */
	boxWidth: number;
	/** The height of the box that the image fits into. */
	boxHeight: number;
	/** How the image should fit into a box. Corresponds to the CSS `object-fit` property. */
	objectFit: "cover" | "contain";

	/** The format of the image copy. */
	format: "jpeg" | "webp" | "png";
	/** A link to the image copy. The path is not prefixed with /api. */
	url: string;
};

/**
 * Represents a list in the Discuit API.
 */
export type ListData = {
	/** The ID of the list. */
	id: number;
	/** The ID of the list owner. */
	userId: string;
	/** The username of the list owner. */
	username: string;
	/** The name of the list. */
	name: string;
	/** The display name of the list. */
	displayName: string;
	/** A description of the list. If no description is set, this is null. */
	description: string | null;
	/** Indicates whether the list is a public or a private list. */
	public: boolean;
	/** Number of items in the list. */
	numItems: number;
	/** The current sorting of the list. */
	sort: "addedDsc" | "addedAsc" | "createdDsc" | "createdAsc";
	/** The time at which the list was created. */
	createdAt: TimeString;
	/** The last time an item was added to the list (for brand new lists this value is the same as createdAt). */
	lastUpdatedAt: TimeString;
};

/**
 * Represents an item in a list in the Discuit API.
 */
export type ListItemData = {
	/** The ID of the list item. */
	id: number;
	/** The ID of the list in which this is an item. */
	listId: number;
	/** The type of the list item, post or comment. */
	targetType: "post" | "comment";
	/** The ID of the original post or comment. */
	targetId: string;
	/** The time at which this list item was created (when the post/comment was added to the list). */
	createdAt: TimeString;
	/** The original post or comment object. */
	targetItem: PostData | Comment;
};

/**
 * Represents a mute action in the Discuit API.
 */
export type MuteData = {
	/** The ID of the mute. */
	id: string;
	/** Whether a user or community is being muted. */
	type: "user" | "community";
	/** If a user is being muted, the ID of the user, otherwise undefined. */
	mutedUserId?: string;
	/** If a community is being muted, the ID of the community, otherwise undefined. */
	mutedCommunityId?: string;

	/** The time at which the mute was created. */
	createdAt: TimeString;

	/** If a user is being muted, the User object of the user, otherwise undefined. */
	mutedUser?: UserData;
	/** If a community is being muted, the Community object of the community, otherwise undefined. */
	mutedCommunity?: CommunityData;
};

/**
 * Represents a notification in the Discuit API.
 */
export type NotificationData = {
	/** The ID of the notification. */
	id: number;

	/** The type of notification. */
	type:
		| "new_comment"
		| "comment_reply"
		| "new_votes"
		| "deleted_post"
		| "mod_add";

	/** The content of the notification. The structure of this object will vary based on the type of notification. */
	notif:
		| NewVotesNotifData
		| DeletedPostNotifData
		| NewCommentNotifData
		| CommentReplyNotifData
		| NewBadgeNotifData
		| ModAddNotifData;

	/** Whether the notification was seen by the authenticated user. */
	seen: boolean;
	/** If the notification was seen, the time at which it was seen, otherwise null. */
	seenAt: TimeString | null;
	/** The time at which the notification was created. */
	createdAt: TimeString;
};

/**
 * Represents a notification for new votes in the Discuit API.
 */
export type NewVotesNotifData = {
	/** The number of votes the post or comment received. */
	noVotes: number;
	/** The ID of the post or comment that was voted on. */
	targetId: string;
	/** The type of the target. */
	targetType: "post" | "comment";
	/** The target item, either of type `Comment` if `targetType` is "comment" or `Post` otherwise. */
	post: PostData | CommentData;
	/** Only present if the `targetType` is "comment". */
	comment?: CommentData;
};

/**
 * Represents a notification for a deleted post in the Discuit API.
 */
export type DeletedPostNotifData = {
	/** The user group that deleted the post. */
	deletedAs: "mods" | "admins";
	/** The post that was deleted. */
	post: PostData;
	/** The ID of the post that was deleted. */
	targetId: string;
	/** The type of the target. */
	targetType: "post" | "comment";
};

/**
 * Represents a notification for a new comment in the Discuit API.
 */
export type NewCommentNotifData = {
	/** The username of the comment author. */
	commentAuthor: string;
	/** The ID of the comment. */
	commentId: string;
	/** The time at which the first comment was created. */
	firstCreatedAt: TimeString;
	/** The number of new comments on the post. */
	noComments: number;
	/** The parent post. */
	post: PostData;
	/** The ID of the post. */
	postId: string;
};

/**
 * Represents a notification for a comment reply in the Discuit API.
 */
export type CommentReplyNotifData = {
	/** The username of the comment author. */
	commentAuthor: string;
	/** The ID of the comment. */
	commentId: string;
	/** The time at which the first comment was created. */
	firstCreatedAt: TimeString;
	/** The number of comments on the post. */
	noComments: number;
	/** The ID of the parent comment. */
	parentCommitId: string;
	/** The parent post. */
	post: PostData;
	/** The ID of the post. */
	postId: string;
};

/**
 * Represents a notification for a new badge in the Discuit API.
 */
export type NewBadgeNotifData = {
	/** The type of the badge. */
	badgeType: string;
	/** The user who received the badge. */
	user: UserData;
};

/**
 * Represents a notification for adding a moderator in the Discuit API.
 */
export type ModAddNotifData = {
	/** The username of the user who added the mod. */
	addedBy: string;
	/** The community where the user was added as a mod. */
	community: CommunityData;
	/** The name of the community. */
	communityName: string;
};

/**
 * Represents a post in the Discuit API.
 */
export type PostData = {
	/** The ID of the post */
	id: string;
	/** The type of post */
	type: "text" | "image" | "link";
	/** The value in https://discuit.net/gaming/post/{publicId} */
	publicId: string;

	/** ID of the author. */
	userId: string;
	/** Username of the author. */
	username: string;
	/** The ID of the Ghost user in case the user deleted their account */
	userGhostId?: string;
	/** In what capacity the post was created. For "speaking officially" as a mod or an admin. */
	userGroup: "normal" | "admins" | "mods";
	/** Indicated whether the author's account is deleted */
	userDeleted: boolean;

	/** If the post is pinned in the community */
	isPinned: boolean;
	/** If the post is pinned site-wide */
	isPinnedSite: boolean;

	/** The ID of the community the post is posted in */
	communityId: string;
	/** The name of that community */
	communityName: string;
	/** The profile picture of that community */
	communityProPic: ImageData;
	/** The banner image of that community */
	communityBannerImage: ImageData;

	/** Greater than 3 characters */
	title: string;
	/** Body of the post (only valid for text posts, null otherwise) */
	body: string | null;
	/** The posted image (only valid for image posts, null otherwise) */
	image: ImageData | null;
	/** The URL of the link. */
	link:
		| {
				url: string;
				/** The hostname of the link. For a URL of "https://discuit.net", this would be "discuit.net". */
				hostname: string;
				/** The image object of the OpenGraph image on the site. If no OpenGraph image was found, this is null. */
				image: ImageData | null;
		  }
		| undefined;

	/** If the post was locked */
	locked: boolean;
	/** Who locked the post. */
	lockedBy: string | null;
	/** In what capacity the post was locked, undefined if the post is not locked */
	lockedByGroup: "owner" | "admins" | "mods" | undefined;
	/** Time at which the post was locked, null if the post is not locked */
	lockedAt: TimeString | null;

	/** The number of upvotes the post has */
	upvotes: number;
	/** The number of downvotes the post has */
	downvotes: number;
	/** For ordering posts by 'hot' */
	hotness: number;

	/** The time when the post was created */
	createdAt: TimeString;
	/** Last edited time. */
	editedAt: TimeString | null;
	/** Either the post created time or, if there are comments on the post, the time the most recent comment was created at. */
	lastActivityAt: TimeString;

	/** If the post was deleted */
	deleted: boolean;
	/** Time at which the post was deleted, null if the post has not been deleted */
	deletedAt: TimeString | null;
	/** ID of the user who deleted the post. */
	deletedBy: string | null;
	/** In what capacity the post was deleted, undefined if the post is not deleted */
	deletedAs: "normal" | "admins" | "mods" | undefined;
	/** If true, the body of the post and all associated links or images are deleted. */
	deletedContent: boolean;
	/** In what capacity the content was deleted, undefined if the content has not been deleted. */
	deletedContentAs: "normal" | "admins" | "mods" | undefined;

	/** Comment count. */
	noComments: number;
	/** Comments of the post. */
	comments: Comment[] | undefined;
	/** Pagination cursor for comments. */
	commentsNext: string | null;

	/** Indicated whether the authenticated user has voted. If not authenticated, the value is null. */
	userVoted: boolean | null;
	/** Indicates whether the authenticated user's vote is an upvote. */
	userVotedUp: boolean | null;

	/** If the author of the post has been muted by the logged in user. */
	isAuthorMuted: boolean;
	/** If the community that the post is in has been muted by the logged in user. */
	isCommunityMuted: boolean;

	/** The Community object of the community that the post is in. */
	community: CommunityData | undefined;
	/** The User object of the author of the post. */
	author: UserData;
};

/**
 * Represents a report in the Discuit API.
 */
export type ReportData = {
	/** The ID of the report. */
	id: number;
	/** The ID of the community in which the report was made. */
	communityId: string;
	/** If reporting a post, the ID of the post on which the report was made, otherwise null. */
	postId: string | null;

	/** The reason why the report was made. */
	reason: string;
	/** A description of the report. This is null if no description is given. */
	description: string | null;
	/** The ID of the report reason. */
	reasonId: number;
	/** Whether the report is on a post or a comment. */
	type: "post" | "comment";
	/** The ID of the post or the comment that was reported. */
	targetId: string;

	/** If an action was taken, a description of the action, otherwise null. */
	actionTaken: string | null;
	/** If the report was dealt with, the time at which it was dealt with, otherwise null. */
	dealtAt: TimeString | null;
	/** If the report was dealt with, the ID of the user by which it was dealt, otherwise null. */
	dealtBy: string | null;

	/** The time that the report was created. */
	createdAt: TimeString;
	/** The Comment or Post objected that the report is made against. */
	target: Comment | PostData;
};

/**
 * Represents a reason for a report in the Discuit API.
 */
export type ReportReasonData = {
	id: number;
	title: string;
	description: string | null;
};

/**
 * Represents a user in the Discuit API.
 */
export type UserData = {
	/** The ID of the user. */
	id: string;
	/** The username of the user. Minimum 3 characters. Maximum 21 characters. */
	username: string;

	/** If an email address was provided, the email address of the user, otherwise null. */
	email: string | null;
	/** If the email address was confirmed, the time at which it was confirmed, otherwise null. */
	emailConfirmedAt: TimeString | null;

	/** The about set by the user. Maximum 10000 characters. If no about was set, this is null. */
	aboutMe: string | null;
	/** The number of points that the user has. */
	points: number;

	/** If the user is an admin. */
	isAdmin: boolean;
	/** If a profile picture was set, the profile picture of the user, otherwise null. */
	proPic: ImageData | null;
	/** The list of badges that the user has, can be empty. */
	badges: BadgeData[];

	/** The number of posts the user has made. */
	noPosts: number;
	/** The number of comments the user has made. */
	noComments: number;

	/** The time at which the account was created. */
	createdAt: TimeString;
	/** If the account has been deleted. */
	deleted: boolean;
	/** If the account was deleted, the time at which it was deleted, otherwise null. */
	deletedAt: TimeString | null | undefined;

	/** If the user has turned off upvote notifications. */
	upvoteNotificationsOff: boolean;
	/** If the user has turned off reply notifications. */
	replyNotificationsOff: boolean;
	/** The feed the user has set as their home feed. */
	homeFeed: "all" | "subscriptions";
	/** If the user wants their feed sort to be remembered. */
	rememberFeedSort: boolean;
	/** If the user wants to turn off embeds for link posts. */
	embedsOff: boolean;
	/** If the user wants to hide other users' profile pictures. */
	hideUserProfilePictures: boolean;

	/** If the user was banned, the time at which they were banned, otherwise null. */
	bannedAt: TimeString | null;
	/** If the user was banned. */
	isBanned: boolean;

	/** The number of new notifications the user has. */
	notificationsNewCount: number;

	/** If the user is a moderator in any communities, the list of communities that the user moderates, otherwise null. */
	moddingList: CommunityData[] | null;
};

/**
 * Represents a badge in the Discuit API.
 */
export type BadgeData = {
	/** The ID of the badge. */
	id: number;
	/** The type of badge. */
	type: string;
};
