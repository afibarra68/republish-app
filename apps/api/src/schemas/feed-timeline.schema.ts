import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type FeedTimelineDocument = HydratedDocument<FeedTimeline>;

@Schema({ timestamps: true, collection: 'feed_timelines' })
export class FeedTimeline {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  postId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  authorId!: Types.ObjectId;

  @Prop({ default: 0 })
  score!: number;

  @Prop({ default: Date.now, index: true })
  insertedAt!: Date;

  @Prop({ enum: ['following', 'suggested', 'promoted'], default: 'following' })
  source!: string;
}

export const FeedTimelineSchema = SchemaFactory.createForClass(FeedTimeline);
FeedTimelineSchema.index({ userId: 1, insertedAt: -1 });
FeedTimelineSchema.index({ userId: 1, score: -1 });
