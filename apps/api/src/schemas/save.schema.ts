import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SaveDocument = HydratedDocument<Save>;

@Schema({ timestamps: true, collection: 'saves' })
export class Save {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  postId!: Types.ObjectId;
}

export const SaveSchema = SchemaFactory.createForClass(Save);
SaveSchema.index({ userId: 1, postId: 1 }, { unique: true });
