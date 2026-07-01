import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ActivityLogDocument = HydratedDocument<ActivityLog>;

@Schema({ timestamps: { createdAt: 'timestamp', updatedAt: false }, collection: 'activity_log' })
export class ActivityLog {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  actorId!: Types.ObjectId;

  @Prop({ required: true, index: true })
  action!: string;

  @Prop({ enum: ['post', 'user', 'company', 'draft', 'story'], required: true })
  targetType!: string;

  @Prop({ type: Types.ObjectId })
  targetId?: Types.ObjectId;

  @Prop({ type: Object, default: {} })
  metadata!: Record<string, unknown>;
}

export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLog);
ActivityLogSchema.index({ actorId: 1, timestamp: -1 });
ActivityLogSchema.index({ action: 1, timestamp: -1 });
