import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Story, StoryDocument } from '../../schemas/story.schema';
import { Follow, FollowDocument } from '../../schemas/follow.schema';
import { Company, CompanyDocument } from '../../schemas/company.schema';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { ActivityAction } from '@republish/shared';

@Injectable()
export class StoriesService {
  constructor(
    @InjectModel(Story.name) private storyModel: Model<StoryDocument>,
    @InjectModel(Follow.name) private followModel: Model<FollowDocument>,
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    private activityLog: ActivityLogService,
  ) {}

  async create(
    authorId: string,
    authorType: 'user' | 'company',
    data: { mediaUrl: string; mediaType?: string; caption?: string },
  ) {
    if (authorType === 'company') {
      const company = await this.companyModel.findById(authorId);
      if (!company?.isVerified) {
        throw new ForbiddenException('Only verified companies can post stories');
      }
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const story = await this.storyModel.create({
      authorId: new Types.ObjectId(authorId),
      authorType,
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType || 'image',
      caption: data.caption || '',
      expiresAt,
    });

    await this.activityLog.log(authorId, ActivityAction.STORY_PUBLISHED, 'story', story._id.toString());

    return story;
  }

  async getFeed(userId: string) {
    const following = await this.followModel.find({ followerId: new Types.ObjectId(userId) }).lean();
    const authorIds = following.map((f) => f.followingId);

    return this.storyModel
      .find({
        authorId: { $in: authorIds },
        expiresAt: { $gt: new Date() },
      })
      .sort({ createdAt: -1 })
      .lean();
  }

  async recordView(storyId: string) {
    await this.storyModel.findByIdAndUpdate(storyId, { $inc: { viewCount: 1 } });
    return { viewed: true };
  }
}
