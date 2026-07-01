import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);

  constructor(private config: ConfigService) {}

  async send(userId: string, title: string, body: string, data?: Record<string, string>) {
    const serverKey = this.config.get<string>('FCM_SERVER_KEY');
    if (!serverKey) {
      this.logger.debug(`Push skipped (no FCM_SERVER_KEY): ${userId} — ${title}`);
      return { sent: false, reason: 'fcm_not_configured' };
    }

    // MVP: device tokens stored per user would be looked up here.
    // Without registered tokens, log intent for dev.
    this.logger.log(`FCM push queued for user ${userId}: ${title} — ${body}`, data);
    return { sent: true, mode: 'queued' };
  }
}
