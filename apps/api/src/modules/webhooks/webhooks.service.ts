import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ExternalConnection, ExternalConnectionDocument } from '../../schemas/external-connection.schema';
import { AiService } from '../ai/ai.service';
import { ContentService } from '../content/content.service';

@Injectable()
export class WebhooksService {
  constructor(
    @InjectModel(ExternalConnection.name)
    private connectionModel: Model<ExternalConnectionDocument>,
    private aiService: AiService,
    private contentService: ContentService,
  ) {}

  async handleWhatsAppMessage(apiKey: string, message: string) {
    const connection = await this.findByApiKey(apiKey);
    if (!connection) return { error: 'Invalid connection' };

    const draft = await this.aiService.generateDraft(connection.userId.toString(), {
      prompt: message,
      mediaUrls: [],
    });

    return {
      status: 'draft_created',
      draftId: draft.draftId,
      preview: draft.preview,
      actions: ['publish', 'edit', 'cancel'],
      message: 'Preview generated. Reply "publish" to confirm or edit your message.',
    };
  }

  async confirmWhatsAppPublish(apiKey: string, draftId: string) {
    const connection = await this.findByApiKey(apiKey);
    if (!connection) return { error: 'Invalid connection' };

    return this.contentService.publishDraft(connection.userId.toString(), draftId);
  }

  async createConnection(userId: string, provider: string) {
    const apiKey = `pub_wh_${crypto.randomBytes(24).toString('hex')}`;
    const apiKeyHash = await bcrypt.hash(apiKey, 10);

    await this.connectionModel.create({
      userId: new Types.ObjectId(userId),
      provider,
      apiKeyHash,
      config: {},
    });

    return { apiKey, provider };
  }

  private async findByApiKey(apiKey: string) {
    const connections = await this.connectionModel.find({ active: true }).lean();
    for (const conn of connections) {
      if (await bcrypt.compare(apiKey, conn.apiKeyHash)) return conn;
    }
    return null;
  }
}
