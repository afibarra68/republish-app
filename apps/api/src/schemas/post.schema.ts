import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { GeoPoint, addLocationHooks } from './geo.schema';

export type PostDocument = HydratedDocument<Post>;

@Schema({ _id: false })
export class AuthorSnapshot {
  @Prop() username!: string;
  @Prop() displayName!: string;
  @Prop() avatar!: string;
  @Prop() isVerified!: boolean;
  @Prop() avgRating?: number;
}

@Schema({ _id: false })
export class MediaItem {
  @Prop() url!: string;
  @Prop({ enum: ['image', 'video'] }) type!: string;
  @Prop() order!: number;
}

@Schema({ _id: false })
export class CommerceData {
  @Prop() commerceType!: string;
  @Prop() category!: string;
  @Prop() price!: number;
  @Prop({ default: 'USD' }) currency!: string;
  @Prop({ default: 'active' }) status!: string;
  @Prop() expiresAt?: Date;
  @Prop({ type: Object, default: {} }) metadata!: Record<string, unknown>;
}

@Schema({ timestamps: true, collection: 'posts' })
export class Post {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  authorId!: Types.ObjectId;

  @Prop({ enum: ['user', 'company'], required: true })
  authorType!: string;

  @Prop({ type: AuthorSnapshot, required: true })
  authorSnapshot!: AuthorSnapshot;

  @Prop({ enum: ['listing', 'promo', 'update'], default: 'listing' })
  postType!: string;

  @Prop({ required: true })
  caption!: string;

  @Prop({ type: [String], default: [] })
  hashtags!: string[];

  @Prop({ type: [MediaItem], default: [] })
  media!: MediaItem[];

  @Prop({ type: CommerceData })
  commerce?: CommerceData;

  @Prop({ type: Object })
  location?: GeoPoint;

  @Prop({ enum: ['public', 'followers'], default: 'public' })
  visibility!: string;

  @Prop({ default: 0 }) likeCount!: number;
  @Prop({ default: 0 }) commentCount!: number;
  @Prop({ default: 0 }) saveCount!: number;
  @Prop({ default: 0 }) viewCount!: number;
  @Prop({ default: 0 }) shareCount!: number;
  @Prop({ default: 0 }) engagementScore!: number;

  @Prop({ index: true })
  publishedAt?: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.index({ publishedAt: -1 });
PostSchema.index({ authorId: 1, publishedAt: -1 });
PostSchema.index({ 'commerce.category': 1, publishedAt: -1 });
PostSchema.index({ location: '2dsphere' }, { sparse: true });
PostSchema.index({ engagementScore: -1, publishedAt: -1 });
PostSchema.index({ hashtags: 1 });
addLocationHooks(PostSchema);
