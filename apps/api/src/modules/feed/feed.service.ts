import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import Redis from 'ioredis';
import { FeedTimeline, FeedTimelineDocument } from '../../schemas/feed-timeline.schema';
import { Post, PostDocument } from '../../schemas/post.schema';
import { Follow, FollowDocument } from '../../schemas/follow.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { ActivityAction } from '@republish/shared';
import { computeEdgeRank } from '@republish/feed-ranking';

@Injectable()
export class FeedService {
  private redis: Redis;

  constructor(
    @InjectModel(FeedTimeline.name) private timelineModel: Model<FeedTimelineDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Follow.name) private followModel: Model<FollowDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private activityLog: ActivityLogService,
    config: ConfigService,
  ) {
    this.redis = new Redis(config.get<string>('REDIS_URL') || 'redis://localhost:6379');
  }

  async fanOut(postId: string, authorId: string, followerCount: number) {
    const threshold = parseInt(process.env.FANOUT_THRESHOLD || '5000', 10);
    if (followerCount >= threshold) return { strategy: 'read' };

    const followers = await this.followModel
      .find({ followingId: new Types.ObjectId(authorId) })
      .lean();

    const post = await this.postModel.findById(postId).lean();
    if (!post) return;

    const score = computeEdgeRank({
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      saveCount: post.saveCount,
      viewCount: post.viewCount,
      publishedAt: post.publishedAt || new Date(),
    });

    const entries = followers.map((f) => ({
      userId: f.followerId,
      postId: new Types.ObjectId(postId),
      authorId: new Types.ObjectId(authorId),
      score,
      insertedAt: new Date(),
      source: 'following',
    }));

    if (entries.length) {
      await this.timelineModel.insertMany(entries, { ordered: false }).catch(() => {});
    }

    for (const f of followers) {
      await this.invalidateCache(f.followerId.toString());
    }

    return { strategy: 'write', count: entries.length };
  }

  async backfillTimeline(followerId: string, followingId: string) {
    const posts = await this.postModel
      .find({ authorId: new Types.ObjectId(followingId), publishedAt: { $ne: null } })
      .sort({ publishedAt: -1 })
      .limit(20)
      .lean();

    const entries = posts.map((p) => ({
      userId: new Types.ObjectId(followerId),
      postId: p._id,
      authorId: p.authorId,
      score: p.engagementScore,
      insertedAt: p.publishedAt || new Date(),
      source: 'following',
    }));

    if (entries.length) {
      await this.timelineModel.insertMany(entries, { ordered: false }).catch(() => {});
    }
    await this.invalidateCache(followerId);
  }

  async getFollowingFeed(userId: string, cursor?: string, limit = 20) {
    const cacheKey = `feed:${userId}:following:${cursor || 'start'}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const query: Record<string, unknown> = { userId: new Types.ObjectId(userId) };
    if (cursor) query.insertedAt = { $lt: new Date(cursor) };

    const timelines = await this.timelineModel
      .find(query)
      .sort({ insertedAt: -1 })
      .limit(limit + 1)
      .lean();

    const hasMore = timelines.length > limit;
    const slice = hasMore ? timelines.slice(0, limit) : timelines;
    const postIds = slice.map((t) => t.postId);

    const posts = await this.postModel.find({ _id: { $in: postIds } }).lean();
    const postMap = new Map(posts.map((p) => [p._id.toString(), p]));
    const items = slice
      .map((t) => postMap.get(t.postId.toString()))
      .filter(Boolean);

    const result = {
      items,
      nextCursor: hasMore ? slice[slice.length - 1].insertedAt.toISOString() : null,
      hasMore,
    };

    await this.redis.setex(cacheKey, 300, JSON.stringify(result));
    await this.activityLog.log(userId, ActivityAction.FEED_VIEW, 'user', userId, { feed: 'following' });

    return result;
  }

  async getForYouFeed(userId: string, cursor?: string, limit = 20): Promise<{
    items: Record<string, unknown>[];
    nextCursor: string | null;
    hasMore: boolean;
  }> {
    const query: Record<string, unknown> = {
      publishedAt: { $ne: null },
      'commerce.status': 'active',
    };
    if (cursor) query.publishedAt = { $lt: new Date(cursor) };

    const posts = await this.postModel
      .find(query)
      .sort({ engagementScore: -1, publishedAt: -1 })
      .limit(limit + 1)
      .lean();

    const hasMore = posts.length > limit;
    const items = hasMore ? posts.slice(0, limit) : posts;

    const ranked = items
      .map((p) => ({
        ...p,
        _rank: computeEdgeRank({
          likeCount: p.likeCount,
          commentCount: p.commentCount,
          saveCount: p.saveCount,
          viewCount: p.viewCount,
          publishedAt: p.publishedAt || new Date(),
        }),
      }))
      .sort((a, b) => b._rank - a._rank);

    return {
      items: ranked,
      nextCursor: hasMore ? items[items.length - 1].publishedAt?.toISOString() ?? null : null,
      hasMore,
    };
  }

  async getNearbyFeed(lat: number, lng: number, radiusKm = 10, cursor?: string, limit = 20) {
    const query: Record<string, unknown> = {
      publishedAt: { $ne: null },
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: radiusKm * 1000,
        },
      },
    };

    const posts = await this.postModel
      .find(query)
      .sort({ publishedAt: -1 })
      .limit(limit + 1)
      .lean();

    const hasMore = posts.length > limit;
    const items = hasMore ? posts.slice(0, limit) : posts;

    return {
      items,
      nextCursor: hasMore ? items[items.length - 1].publishedAt?.toISOString() ?? null : null,
      hasMore,
    };
  }

  private async invalidateCache(userId: string) {
    const keys = await this.redis.keys(`feed:${userId}:*`);
    if (keys.length) await this.redis.del(...keys);
  }
}
