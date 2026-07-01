import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../schemas/user.schema';
import { Company, CompanyDocument } from '../../schemas/company.schema';
import { Post, PostDocument } from '../../schemas/post.schema';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
  ) {}

  async getUserByUsername(username: string) {
    const user = await this.userModel.findOne({ 'profile.username': username }).lean();
    if (!user) throw new NotFoundException('User not found');
    return {
      id: user._id.toString(),
      profile: user.profile,
      createdAt: (user as { createdAt?: Date }).createdAt,
    };
  }

  async getUserPosts(username: string, cursor?: string, limit = 20) {
    const user = await this.userModel.findOne({ 'profile.username': username }).lean();
    if (!user) throw new NotFoundException('User not found');

    const query: Record<string, unknown> = {
      authorId: user._id,
      publishedAt: { $ne: null },
    };
    if (cursor) {
      query.publishedAt = { $lt: new Date(cursor) };
    }

    const posts = await this.postModel
      .find(query)
      .sort({ publishedAt: -1 })
      .limit(limit + 1)
      .lean();

    const hasMore = posts.length > limit;
    const items = hasMore ? posts.slice(0, limit) : posts;
    const nextCursor = hasMore
      ? items[items.length - 1].publishedAt?.toISOString() ?? null
      : null;

    return { items, nextCursor, hasMore };
  }

  async getCompanyBySlug(slug: string) {
    const company = await this.companyModel.findOne({ slug }).lean();
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async getCompanyPosts(slug: string, cursor?: string, limit = 20) {
    const company = await this.companyModel.findOne({ slug }).lean();
    if (!company) throw new NotFoundException('Company not found');

    const query: Record<string, unknown> = {
      authorId: company._id,
      publishedAt: { $ne: null },
    };
    if (cursor) query.publishedAt = { $lt: new Date(cursor) };

    const posts = await this.postModel
      .find(query)
      .sort({ publishedAt: -1 })
      .limit(limit + 1)
      .lean();

    const hasMore = posts.length > limit;
    const items = hasMore ? posts.slice(0, limit) : posts;
    const nextCursor = hasMore
      ? items[items.length - 1].publishedAt?.toISOString() ?? null
      : null;

    return { items, nextCursor, hasMore };
  }
}
