import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true, collection: 'comments' })
export class Comment {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  postId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  authorId!: Types.ObjectId;

  @Prop({ required: true })
  text!: string;

  @Prop({ type: Object })
  authorSnapshot!: { username: string; displayName: string; avatar: string };
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
CommentSchema.index({ postId: 1, createdAt: -1 });
