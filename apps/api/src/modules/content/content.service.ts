import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Post, PostDocument } from '../../schemas/post.schema';
import { PostDraft, PostDraftDocument } from '../../schemas/post-draft.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { Company, CompanyDocument } from '../../schemas/company.schema';
import { Comment, CommentDocument } from '../../schemas/comment.schema';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { EVENT_NAMES, QUEUE_NAMES, ActivityAction, CommerceStatus } from '@republish/shared';
import { computeEngagementScore } from '@republish/feed-ranking';

@Injectable()
export class ContentService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(PostDraft.name) private draftModel: Model<PostDraftDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectQueue(QUEUE_NAMES.FEED_FANOUT) private fanoutQueue: Queue,
    @InjectQueue(QUEUE_NAMES.NOTIFICATIONS) private notifQueue: Queue,
    private activityLog: ActivityLogService,
    private config: ConfigService,
  ) {}

  async getPost(id: string) {
    const post = await this.postModel.findById(id).lean();
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async recordView(postId: string, viewerId?: string) {
    await this.postModel.findByIdAndUpdate(postId, { $inc: { viewCount: 1 } });
    if (viewerId) {
      await this.activityLog.log(viewerId, ActivityAction.POST_VIEWED, 'post', postId);
    }
    return { viewed: true };
  }

  async share(postId: string) {
    await this.postModel.findByIdAndUpdate(postId, { $inc: { shareCount: 1 } });
    return { shared: true };
  }

  async createDraft(
    userId: string,
    prompt: string,
    mediaUrls: string[],
    generated: { caption: string; hashtags: string[]; commerce: Record<string, unknown> },
  ) {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const draft = await this.draftModel.create({
      userId: new Types.ObjectId(userId),
      status: 'pending_confirmation',
      prompt,
      mediaUrls,
      generated,
      preview: { caption: generated.caption, hashtags: generated.hashtags, commerce: generated.commerce, mediaUrls },
      expiresAt,
    });

    await this.activityLog.log(userId, ActivityAction.DRAFT_CREATED, 'draft', draft._id.toString());

    return {
      draftId: draft._id.toString(),
      preview: draft.preview,
      status: draft.status,
    };
  }

  async getDraft(userId: string, draftId: string) {
    const draft = await this.draftModel.findOne({
      _id: new Types.ObjectId(draftId),
      userId: new Types.ObjectId(userId),
    }).lean();
    if (!draft) throw new NotFoundException('Draft not found');
    return draft;
  }

  async listDrafts(userId: string) {
    return this.draftModel
      .find({ userId: new Types.ObjectId(userId), status: 'pending_confirmation' })
      .sort({ createdAt: -1 })
      .lean();
  }

  async updateDraft(
    userId: string,
    draftId: string,
    changes: { caption?: string; price?: number; hashtags?: string[] },
  ) {
    const draft = await this.draftModel.findOne({
      _id: new Types.ObjectId(draftId),
      userId: new Types.ObjectId(userId),
      status: 'pending_confirmation',
    });
    if (!draft) throw new NotFoundException('Draft not found');

    if (changes.caption && draft.generated) draft.generated.caption = changes.caption;
    if (changes.hashtags && draft.generated) draft.generated.hashtags = changes.hashtags;
    if (changes.price !== undefined && draft.generated?.commerce) {
      (draft.generated.commerce as Record<string, unknown>).price = changes.price;
    }
    draft.preview = {
      caption: draft.generated?.caption,
      hashtags: draft.generated?.hashtags,
      commerce: draft.generated?.commerce,
      mediaUrls: draft.mediaUrls,
    };
    await draft.save();
    return { draftId, preview: draft.preview };
  }

  async cancelDraft(userId: string, draftId: string) {
    const result = await this.draftModel.updateOne(
      { _id: new Types.ObjectId(draftId), userId: new Types.ObjectId(userId) },
      { status: 'cancelled' },
    );
    if (!result.modifiedCount) throw new NotFoundException('Draft not found');
    return { cancelled: true };
  }

  async publishDraft(userId: string, draftId: string) {
    const draft = await this.draftModel.findOne({
      _id: new Types.ObjectId(draftId),
      userId: new Types.ObjectId(userId),
      status: 'pending_confirmation',
    });
    if (!draft) throw new NotFoundException('Draft not found or already published');
    if (!draft.generated) throw new BadRequestException('Draft has no generated content');

    const user = await this.userModel.findById(userId).lean();
    if (!user) throw new NotFoundException('User not found');

    const commerce = draft.generated.commerce as Record<string, unknown>;
    const media = draft.mediaUrls.map((url, i) => ({
      url,
      type: url.match(/\.(mp4|mov|webm)$/i) ? 'video' : 'image',
      order: i,
    }));

    const post = await this.postModel.create({
      authorId: new Types.ObjectId(userId),
      authorType: 'user',
      authorSnapshot: {
        username: user.profile.username,
        displayName: user.profile.displayName,
        avatar: user.profile.avatar,
        isVerified: user.profile.isVerified,
      },
      postType: commerce.commerceType === 'promo' ? 'promo' : 'listing',
      caption: draft.generated.caption,
      hashtags: draft.generated.hashtags,
      media,
      commerce: {
        ...commerce,
        status: CommerceStatus.ACTIVE,
      },
      visibility: 'public',
      publishedAt: new Date(),
      engagementScore: 0,
    });

    await this.userModel.findByIdAndUpdate(userId, { $inc: { 'profile.postCount': 1 } });
    draft.status = 'published';
    await draft.save();

    const followerCount = user.profile.followerCount;

    await this.fanoutQueue.add(EVENT_NAMES.POST_PUBLISHED, {
      postId: post._id.toString(),
      authorId: userId,
      authorType: 'user',
      followerCount,
    });

    await this.notifQueue.add(EVENT_NAMES.POST_PUBLISHED, {
      postId: post._id.toString(),
      authorId: userId,
      authorType: 'user',
      followerCount,
    });

    await this.activityLog.log(userId, ActivityAction.POST_PUBLISHED, 'post', post._id.toString());

    const baseUrl = this.config.get('APP_BASE_URL', 'http://localhost:3000');
    return {
      postId: post._id.toString(),
      url: `${baseUrl}/p/${post._id.toString()}`,
      publishedAt: post.publishedAt,
    };
  }

  async addComment(userId: string, postId: string, text: string) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    const user = await this.userModel.findById(userId).lean();
    if (!user) throw new NotFoundException('User not found');

    const comment = await this.commentModel.create({
      postId: new Types.ObjectId(postId),
      authorId: new Types.ObjectId(userId),
      text,
      authorSnapshot: {
        username: user.profile.username,
        displayName: user.profile.displayName,
        avatar: user.profile.avatar,
      },
    });

    await this.postModel.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

    await this.notifQueue.add('comment.created', {
      postId,
      authorId: post.authorId.toString(),
      commenterId: userId,
      text,
    });

    return comment;
  }

  async getComments(postId: string, cursor?: string, limit = 20) {
    const query: Record<string, unknown> = { postId: new Types.ObjectId(postId) };
    if (cursor) query.createdAt = { $lt: new Date(cursor) };

    const comments = await this.commentModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .lean();

    const hasMore = comments.length > limit;
    const items = hasMore ? comments.slice(0, limit) : comments;
    const nextCursor = hasMore
      ? (items[items.length - 1] as { createdAt?: Date }).createdAt?.toISOString() ?? null
      : null;

    return { items, nextCursor, hasMore };
  }
}
