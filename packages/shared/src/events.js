"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVENT_NAMES = exports.QUEUE_NAMES = void 0;
exports.QUEUE_NAMES = {
    FEED_FANOUT: 'feed-fanout',
    NOTIFICATIONS: 'notifications',
    FEED_BACKFILL: 'feed-backfill',
    MEDIA_PROCESS: 'media-process',
    AI_PROCESS: 'ai-process',
};
exports.EVENT_NAMES = {
    POST_PUBLISHED: 'post.published',
    POST_LIKED: 'post.liked',
    USER_FOLLOWED: 'user.followed',
    MEDIA_UPLOADED: 'media.uploaded',
    DRAFT_GENERATED: 'draft.generated',
};
//# sourceMappingURL=events.js.map