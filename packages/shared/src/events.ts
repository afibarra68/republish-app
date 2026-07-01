export const QUEUE_NAMES = {
  FEED_FANOUT: 'feed-fanout',
  NOTIFICATIONS: 'notifications',
  FEED_BACKFILL: 'feed-backfill',
  MEDIA_PROCESS: 'media-process',
  AI_PROCESS: 'ai-process',
} as const;

export const EVENT_NAMES = {
  POST_PUBLISHED: 'post.published',
  POST_LIKED: 'post.liked',
  USER_FOLLOWED: 'user.followed',
  MEDIA_UPLOADED: 'media.uploaded',
  DRAFT_GENERATED: 'draft.generated',
} as const;

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
