import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../../schemas/post.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { Company, CompanyDocument } from '../../schemas/company.schema';

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
  ) {}

  async trending(cursor?: string, limit = 20) {
    const query: Record<string, unknown> = { publishedAt: { $ne: null } };
    if (cursor) query.publishedAt = { $lt: new Date(cursor) };

    const posts = await this.postModel
      .find(query)
      .sort({ engagementScore: -1, publishedAt: -1 })
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

  async byCategory(category: string, cursor?: string, limit = 20) {
    const query: Record<string, unknown> = {
      publishedAt: { $ne: null },
      'commerce.category': category,
    };
    if (cursor) query.publishedAt = { $lt: new Date(cursor) };

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

  async searchUsers(q: string, limit = 10) {
    const regex = new RegExp(q, 'i');
    return this.userModel
      .find({ $or: [{ 'profile.username': regex }, { 'profile.displayName': regex }] })
      .limit(limit)
      .lean();
  }
}
