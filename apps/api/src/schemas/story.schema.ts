import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type StoryDocument = HydratedDocument<Story>;

@Schema({ timestamps: true, collection: 'stories' })
export class Story {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  authorId!: Types.ObjectId;

  @Prop({ enum: ['user', 'company'], default: 'company' })
  authorType!: string;

  @Prop({ required: true })
  mediaUrl!: string;

  @Prop({ enum: ['image', 'video'], default: 'image' })
  mediaType!: string;

  @Prop({ default: '' })
  caption!: string;

  @Prop({ required: true, index: true })
  expiresAt!: Date;

  @Prop({ default: 0 })
  viewCount!: number;
}

export const StorySchema = SchemaFactory.createForClass(Story);
StorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
