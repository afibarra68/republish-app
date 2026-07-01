export declare enum AuthorType {
    USER = "user",
    COMPANY = "company"
}
export declare enum PostType {
    LISTING = "listing",
    PROMO = "promo",
    UPDATE = "update"
}
export declare enum CommerceType {
    SALE = "sale",
    RENT = "rent",
    PROMO = "promo",
    SERVICE = "service"
}
export declare enum CommerceCategory {
    VEHICLE = "vehicle",
    ELECTRONICS = "electronics",
    FOOD = "food",
    EQUIPMENT = "equipment",
    OTHER = "other"
}
export declare enum CommerceStatus {
    DRAFT = "draft",
    ACTIVE = "active",
    SOLD = "sold",
    EXPIRED = "expired"
}
export declare enum Visibility {
    PUBLIC = "public",
    FOLLOWERS = "followers"
}
export declare enum DraftStatus {
    GENERATING = "generating",
    PENDING_CONFIRMATION = "pending_confirmation",
    PUBLISHED = "published",
    CANCELLED = "cancelled"
}
export declare enum FollowTargetType {
    USER = "user",
    COMPANY = "company"
}
export declare enum ActivityAction {
    POST_PUBLISHED = "POST_PUBLISHED",
    POST_LIKED = "POST_LIKED",
    POST_VIEWED = "POST_VIEWED",
    USER_FOLLOWED = "USER_FOLLOWED",
    DRAFT_CREATED = "DRAFT_CREATED",
    FEED_VIEW = "FEED_VIEW",
    STORY_PUBLISHED = "STORY_PUBLISHED",
    RATING_CREATED = "RATING_CREATED"
}
export declare enum NotificationType {
    LIKE = "like",
    COMMENT = "comment",
    FOLLOW = "follow",
    NEW_POST = "new_post",
    RATING = "rating"
}
export declare enum ExternalProvider {
    WHATSAPP = "whatsapp",
    TELEGRAM = "telegram",
    API = "api",
    WEBHOOK = "webhook"
}
export declare enum MediaType {
    IMAGE = "image",
    VIDEO = "video"
}
export declare enum FeedSource {
    FOLLOWING = "following",
    SUGGESTED = "suggested",
    PROMOTED = "promoted"
}
