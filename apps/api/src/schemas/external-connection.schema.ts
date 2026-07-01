import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ExternalConnectionDocument = HydratedDocument<ExternalConnection>;

@Schema({ timestamps: true, collection: 'external_connections' })
export class ExternalConnection {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ enum: ['whatsapp', 'telegram', 'api', 'webhook'], required: true })
  provider!: string;

  @Prop({ required: true })
  apiKeyHash!: string;

  @Prop({ type: Object, default: {} })
  config!: Record<string, unknown>;

  @Prop({ default: true })
  active!: boolean;
}

export const ExternalConnectionSchema = SchemaFactory.createForClass(ExternalConnection);
