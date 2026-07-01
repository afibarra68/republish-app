"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedSource = exports.MediaType = exports.ExternalProvider = exports.NotificationType = exports.ActivityAction = exports.FollowTargetType = exports.DraftStatus = exports.Visibility = exports.CommerceStatus = exports.CommerceCategory = exports.CommerceType = exports.PostType = exports.AuthorType = void 0;
var AuthorType;
(function (AuthorType) {
    AuthorType["USER"] = "user";
    AuthorType["COMPANY"] = "company";
})(AuthorType || (exports.AuthorType = AuthorType = {}));
var PostType;
(function (PostType) {
    PostType["LISTING"] = "listing";
    PostType["PROMO"] = "promo";
    PostType["UPDATE"] = "update";
})(PostType || (exports.PostType = PostType = {}));
var CommerceType;
(function (CommerceType) {
    CommerceType["SALE"] = "sale";
    CommerceType["RENT"] = "rent";
    CommerceType["PROMO"] = "promo";
    CommerceType["SERVICE"] = "service";
})(CommerceType || (exports.CommerceType = CommerceType = {}));
var CommerceCategory;
(function (CommerceCategory) {
    CommerceCategory["VEHICLE"] = "vehicle";
    CommerceCategory["ELECTRONICS"] = "electronics";
    CommerceCategory["FOOD"] = "food";
    CommerceCategory["EQUIPMENT"] = "equipment";
    CommerceCategory["OTHER"] = "other";
})(CommerceCategory || (exports.CommerceCategory = CommerceCategory = {}));
var CommerceStatus;
(function (CommerceStatus) {
    CommerceStatus["DRAFT"] = "draft";
    CommerceStatus["ACTIVE"] = "active";
    CommerceStatus["SOLD"] = "sold";
    CommerceStatus["EXPIRED"] = "expired";
})(CommerceStatus || (exports.CommerceStatus = CommerceStatus = {}));
var Visibility;
(function (Visibility) {
    Visibility["PUBLIC"] = "public";
    Visibility["FOLLOWERS"] = "followers";
})(Visibility || (exports.Visibility = Visibility = {}));
var DraftStatus;
(function (DraftStatus) {
    DraftStatus["GENERATING"] = "generating";
    DraftStatus["PENDING_CONFIRMATION"] = "pending_confirmation";
    DraftStatus["PUBLISHED"] = "published";
    DraftStatus["CANCELLED"] = "cancelled";
})(DraftStatus || (exports.DraftStatus = DraftStatus = {}));
var FollowTargetType;
(function (FollowTargetType) {
    FollowTargetType["USER"] = "user";
    FollowTargetType["COMPANY"] = "company";
})(FollowTargetType || (exports.FollowTargetType = FollowTargetType = {}));
var ActivityAction;
(function (ActivityAction) {
    ActivityAction["POST_PUBLISHED"] = "POST_PUBLISHED";
    ActivityAction["POST_LIKED"] = "POST_LIKED";
    ActivityAction["POST_VIEWED"] = "POST_VIEWED";
    ActivityAction["USER_FOLLOWED"] = "USER_FOLLOWED";
    ActivityAction["DRAFT_CREATED"] = "DRAFT_CREATED";
    ActivityAction["FEED_VIEW"] = "FEED_VIEW";
    ActivityAction["STORY_PUBLISHED"] = "STORY_PUBLISHED";
    ActivityAction["RATING_CREATED"] = "RATING_CREATED";
})(ActivityAction || (exports.ActivityAction = ActivityAction = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["LIKE"] = "like";
    NotificationType["COMMENT"] = "comment";
    NotificationType["FOLLOW"] = "follow";
    NotificationType["NEW_POST"] = "new_post";
    NotificationType["RATING"] = "rating";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var ExternalProvider;
(function (ExternalProvider) {
    ExternalProvider["WHATSAPP"] = "whatsapp";
    ExternalProvider["TELEGRAM"] = "telegram";
    ExternalProvider["API"] = "api";
    ExternalProvider["WEBHOOK"] = "webhook";
})(ExternalProvider || (exports.ExternalProvider = ExternalProvider = {}));
var MediaType;
(function (MediaType) {
    MediaType["IMAGE"] = "image";
    MediaType["VIDEO"] = "video";
})(MediaType || (exports.MediaType = MediaType = {}));
var FeedSource;
(function (FeedSource) {
    FeedSource["FOLLOWING"] = "following";
    FeedSource["SUGGESTED"] = "suggested";
    FeedSource["PROMOTED"] = "promoted";
})(FeedSource || (exports.FeedSource = FeedSource = {}));
//# sourceMappingURL=enums.js.map