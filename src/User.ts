import type { DiscuitClient } from "./DiscuitClient.ts";
import type {
	BadgeData,
	CommunityData,
	ImageData,
	TimeString,
	UserData,
} from "./types.ts";

export class User {
	private readonly client!: DiscuitClient;
	/** The ID of the user. */
	public readonly id!: string;
	/** The username of the user. Minimum 3 characters. Maximum 21 characters. */
	public readonly username!: string;

	/** If an email address was provided, the email address of the user, otherwise null. */
	public readonly email!: string | null;
	/** If the email address was confirmed, the time at which it was confirmed, otherwise null. */
	public readonly emailConfirmedAt!: TimeString | null;

	/** The about set by the user. Maximum 10000 characters. If no about was set, this is null. */
	public readonly aboutMe!: string | null;
	/** The number of points that the user has. */
	public readonly points!: number;

	/** If the user is an admin. */
	public readonly isAdmin!: boolean;
	/** If a profile picture was set, the profile picture of the user, otherwise null. */
	public readonly proPic!: ImageData | null;
	/** The list of badges that the user has, can be empty. */
	public readonly badges!: BadgeData[];

	/** The number of posts the user has made. */
	public readonly noPosts!: number;
	/** The number of comments the user has made. */
	public readonly noComments!: number;

	/** The time at which the account was created. */
	public readonly createdAt!: TimeString;
	/** If the account has been deleted. */
	public readonly deleted!: boolean;
	/** If the account was deleted, the time at which it was deleted, otherwise null. */
	public readonly deletedAt!: TimeString | null | undefined;

	/** If the user has turned off upvote notifications. */
	public readonly upvoteNotificationsOff!: boolean;
	/** If the user has turned off reply notifications. */
	public readonly replyNotificationsOff!: boolean;
	/** The feed the user has set as their home feed. */
	public readonly homeFeed!: "all" | "subscriptions";
	/** If the user wants their feed sort to be remembered. */
	public readonly rememberFeedSort!: boolean;
	/** If the user wants to turn off embeds for link posts. */
	public readonly embedsOff!: boolean;
	/** If the user wants to hide other users' profile pictures. */
	public readonly hideUserProfilePictures!: boolean;

	/** If the user was banned, the time at which they were banned, otherwise null. */
	public readonly bannedAt!: TimeString | null;
	/** If the user was banned. */
	public readonly isBanned!: boolean;

	/** The number of new notifications the user has. */
	public readonly notificationsNewCount!: number;

	/** If the user is a moderator in any communities, the list of communities that the user moderates, otherwise null. */
	public readonly moddingList!: CommunityData[] | null;

	/**
	 * @name constructor
	 * @description Create a new User object.
	 * @param client The client that created this user.
	 * @param userData The data of the user.
	 * @example
	 * ```ts
	 * import { User } from "discuit";
	 *
	 * const user = new User(client, UserData);
	 * console.log(user.username);
	 */
	constructor(client: DiscuitClient, userData: UserData) {
		this.client = client;
		Object.assign(this, userData);
	}

	// TODO: Add methods to interact with the user.
}
