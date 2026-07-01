import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CompanyRatingDocument = HydratedDocument<CompanyRating>;

@Schema({ timestamps: true, collection: 'company_ratings' })
export class CompanyRating {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  companyId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  authorId!: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  score!: number;

  @Prop({ default: '' })
  comment!: string;

  @Prop({ type: Object })
  authorSnapshot!: { username: string; displayName: string; avatar: string };
}

export const CompanyRatingSchema = SchemaFactory.createForClass(CompanyRating);
CompanyRatingSchema.index({ companyId: 1, createdAt: -1 });
