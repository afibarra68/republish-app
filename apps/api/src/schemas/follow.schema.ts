import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type FollowDocument = HydratedDocument<Follow>;

@Schema({ timestamps: true, collection: 'follows' })
export class Follow {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  followerId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  followingId!: Types.ObjectId;

  @Prop({ enum: ['user', 'company'], required: true })
  targetType!: string;
}

export const FollowSchema = SchemaFactory.createForClass(Follow);
FollowSchema.index({ followerId: 1, followingId: 1, targetType: 1 }, { unique: true });
