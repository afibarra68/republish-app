import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { GeoPoint, addLocationHooks } from './geo.schema';

export type CompanyDocument = HydratedDocument<Company>;

@Schema({ timestamps: true, collection: 'companies' })
export class Company {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId!: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  slug!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ default: '' })
  logo!: string;

  @Prop({ default: 'other' })
  category!: string;

  @Prop({ type: Object, default: {} })
  contactInfo!: { phone?: string; whatsapp?: string; address?: string };

  @Prop({ type: Object, default: {} })
  hours!: Record<string, string>;

  @Prop({ default: 0 })
  avgRating!: number;

  @Prop({ default: 0 })
  reviewCount!: number;

  @Prop({ default: 0 })
  followerCount!: number;

  @Prop({ default: false })
  isVerified!: boolean;

  @Prop({ type: Object })
  location?: GeoPoint;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
CompanySchema.index({ slug: 1 }, { unique: true });
CompanySchema.index({ location: '2dsphere' }, { sparse: true });
addLocationHooks(CompanySchema);
