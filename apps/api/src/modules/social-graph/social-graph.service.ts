import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Model, Types } from 'mongoose';
import { Follow, FollowDocument } from '../../schemas/follow.schema';
import { Like, LikeDocument } from '../../schemas/like.schema';
import { Save, SaveDocument } from '../../schemas/save.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { Company, CompanyDocument } from '../../schemas/company.schema';
import { Post, PostDocument } from '../../schemas/post.schema';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { EVENT_NAMES, QUEUE_NAMES, ActivityAction } from '@republish/shared';

@Injectable()
export class SocialGraphService {
  constructor(
    @InjectModel(Follow.name) private followModel: Model<FollowDocument>,
    @InjectModel(Like.name) private likeModel: Model<LikeDocument>,
    @InjectModel(Save.name) private saveModel: Model<SaveDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectQueue(QUEUE_NAMES.FEED_BACKFILL) private backfillQueue: Queue,
    @InjectQueue(QUEUE_NAMES.NOTIFICATIONS) private notifQueue: Queue,
    private activityLog: ActivityLogService,
  ) {}

  async follow(followerId: string, followingId: string, targetType: 'user' | 'company') {
    try {
      await this.followModel.create({
        followerId: new Types.ObjectId(followerId),
        followingId: new Types.ObjectId(followingId),
        targetType,
      });
    } catch {
      throw new ConflictException('Already following');
    }

    await this.userModel.findByIdAndUpdate(followerId, { $inc: { 'profile.followingCount': 1 } });

    if (targetType === 'user') {
      await this.userModel.findByIdAndUpdate(followingId, { $inc: { 'profile.followerCount': 1 } });
    } else {
      await this.companyModel.findByIdAndUpdate(followingId, { $inc: { followerCount: 1 } });
    }

    await this.backfillQueue.add(EVENT_NAMES.USER_FOLLOWED, {
      followerId,
      followingId,
      targetType,
    });

    await this.notifQueue.add(EVENT_NAMES.USER_FOLLOWED, {
      followerId,
      followingId,
      targetType,
    });

    await this.activityLog.log(
      followerId,
      ActivityAction.USER_FOLLOWED,
      targetType,
      followingId,
    );

    return { following: true };
  }

  async unfollow(followerId: string, followingId: string, targetType: 'user' | 'company') {
    const result = await this.followModel.deleteOne({
      followerId: new Types.ObjectId(followerId),
      followingId: new Types.ObjectId(followingId),
      targetType,
    });
    if (!result.deletedCount) throw new NotFoundException('Not following');

    await this.userModel.findByIdAndUpdate(followerId, { $inc: { 'profile.followingCount': -1 } });
    if (targetType === 'user') {
      await this.userModel.findByIdAndUpdate(followingId, { $inc: { 'profile.followerCount': -1 } });
    } else {
      await this.companyModel.findByIdAndUpdate(followingId, { $inc: { followerCount: -1 } });
    }

    return { following: false };
  }

  async like(userId: string, postId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    try {
      await this.likeModel.create({
        userId: new Types.ObjectId(userId),
        postId: new Types.ObjectId(postId),
      });
    } catch {
      throw new ConflictException('Already liked');
    }

    await this.postModel.findByIdAndUpdate(postId, { $inc: { likeCount: 1 } });

    await this.notifQueue.add(EVENT_NAMES.POST_LIKED, {
      postId,
      authorId: post.authorId.toString(),
      likerId: userId,
    });

    await this.activityLog.log(userId, ActivityAction.POST_LIKED, 'post', postId);

    return { liked: true };
  }

  async unlike(userId: string, postId: string) {
    const result = await this.likeModel.deleteOne({
      userId: new Types.ObjectId(userId),
      postId: new Types.ObjectId(postId),
    });
    if (!result.deletedCount) throw new NotFoundException('Not liked');
    await this.postModel.findByIdAndUpdate(postId, { $inc: { likeCount: -1 } });
    return { liked: false };
  }

  async save(userId: string, postId: string) {
    try {
      await this.saveModel.create({
        userId: new Types.ObjectId(userId),
        postId: new Types.ObjectId(postId),
      });
    } catch {
      throw new ConflictException('Already saved');
    }
    await this.postModel.findByIdAndUpdate(postId, { $inc: { saveCount: 1 } });
    return { saved: true };
  }

  async unsave(userId: string, postId: string) {
    const result = await this.saveModel.deleteOne({
      userId: new Types.ObjectId(userId),
      postId: new Types.ObjectId(postId),
    });
    if (!result.deletedCount) throw new NotFoundException('Not saved');
    await this.postModel.findByIdAndUpdate(postId, { $inc: { saveCount: -1 } });
    return { saved: false };
  }

  async getFollowers(targetId: string, targetType: string) {
    return this.followModel
      .find({ followingId: new Types.ObjectId(targetId), targetType })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
  }

  async getFollowing(userId: string) {
    return this.followModel
      .find({ followerId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
  }

  async getSuggestions(userId: string) {
    const companies = await this.companyModel
      .find({ isVerified: true })
      .sort({ followerCount: -1 })
      .limit(10)
      .lean();
    return companies.map((c) => ({
      id: c._id.toString(),
      type: 'company',
      name: c.name,
      slug: c.slug,
      logo: c.logo,
      followerCount: c.followerCount,
      avgRating: c.avgRating,
    }));
  }
}
