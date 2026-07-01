import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type LikeDocument = HydratedDocument<Like>;

@Schema({ timestamps: true, collection: 'likes' })
export class Like {
  @Prop({ type: Types.ObjectId, required: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  postId!: Types.ObjectId;
}

export const LikeSchema = SchemaFactory.createForClass(Like);
LikeSchema.index({ userId: 1, postId: 1 }, { unique: true });
