import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Company, CompanyDocument } from '../../schemas/company.schema';
import { CompanyRating, CompanyRatingDocument } from '../../schemas/company-rating.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { ActivityAction } from '@republish/shared';

@Injectable()
export class CommerceService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    @InjectModel(CompanyRating.name) private ratingModel: Model<CompanyRatingDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private activityLog: ActivityLogService,
  ) {}

  async createCompany(
    ownerId: string,
    data: {
      name: string;
      slug: string;
      category?: string;
      contactInfo?: Record<string, string>;
    },
  ) {
    const existing = await this.companyModel.findOne({ slug: data.slug });
    if (existing) throw new BadRequestException('Slug already taken');

    const company = await this.companyModel.create({
      ownerId: new Types.ObjectId(ownerId),
      name: data.name,
      slug: data.slug,
      category: data.category || 'other',
      contactInfo: data.contactInfo || {},
    });

    return {
      id: company._id.toString(),
      slug: company.slug,
      name: company.name,
      category: company.category,
      avgRating: company.avgRating,
      reviewCount: company.reviewCount,
    };
  }

  async addRating(userId: string, companyId: string, score: number, comment: string) {
    const company = await this.companyModel.findById(companyId);
    if (!company) throw new NotFoundException('Company not found');

    const user = await this.userModel.findById(userId).lean();
    if (!user) throw new NotFoundException('User not found');

    await this.ratingModel.create({
      companyId: new Types.ObjectId(companyId),
      authorId: new Types.ObjectId(userId),
      score,
      comment,
      authorSnapshot: {
        username: user.profile.username,
        displayName: user.profile.displayName,
        avatar: user.profile.avatar,
      },
    });

    const agg = await this.ratingModel.aggregate([
      { $match: { companyId: new Types.ObjectId(companyId) } },
      { $group: { _id: null, avg: { $avg: '$score' }, count: { $sum: 1 } } },
    ]);

    const avgRating = agg[0]?.avg ?? score;
    const reviewCount = agg[0]?.count ?? 1;

    await this.companyModel.findByIdAndUpdate(companyId, { avgRating, reviewCount });

    await this.activityLog.log(userId, ActivityAction.RATING_CREATED, 'company', companyId, { score });

    return { avgRating, reviewCount };
  }

  async getRatings(companyId: string, limit = 20) {
    return this.ratingModel
      .find({ companyId: new Types.ObjectId(companyId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }
}
