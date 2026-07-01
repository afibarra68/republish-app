import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PostDraftDocument = HydratedDocument<PostDraft>;

@Schema({ timestamps: true, collection: 'post_drafts' })
export class PostDraft {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({
    enum: ['generating', 'pending_confirmation', 'published', 'cancelled'],
    default: 'generating',
    index: true,
  })
  status!: string;

  @Prop({ required: true })
  prompt!: string;

  @Prop({ type: [String], default: [] })
  mediaUrls!: string[];

  @Prop({ type: Object })
  generated?: {
    caption: string;
    hashtags: string[];
    commerce: Record<string, unknown>;
  };

  @Prop({ type: Object })
  preview?: Record<string, unknown>;

  @Prop({ index: true })
  expiresAt!: Date;
}

export const PostDraftSchema = SchemaFactory.createForClass(PostDraft);
PostDraftSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
