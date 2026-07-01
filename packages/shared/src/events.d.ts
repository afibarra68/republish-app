export declare const QUEUE_NAMES: {
    readonly FEED_FANOUT: "feed-fanout";
    readonly NOTIFICATIONS: "notifications";
    readonly FEED_BACKFILL: "feed-backfill";
    readonly MEDIA_PROCESS: "media-process";
    readonly AI_PROCESS: "ai-process";
};
export declare const EVENT_NAMES: {
    readonly POST_PUBLISHED: "post.published";
    readonly POST_LIKED: "post.liked";
    readonly USER_FOLLOWED: "user.followed";
    readonly MEDIA_UPLOADED: "media.uploaded";
    readonly DRAFT_GENERATED: "draft.generated";
};
export interface PostPublishedEvent {
    postId: string;
    authorId: string;
    authorType: string;
    followerCount: number;
}
export interface PostLikedEvent {
    postId: string;
    authorId: string;
    likerId: string;
}
export interface UserFollowedEvent {
    followerId: string;
    followingId: string;
    targetType: string;
}
export interface MediaUploadedEvent {
    mediaId: string;
    url: string;
    userId: string;
}
