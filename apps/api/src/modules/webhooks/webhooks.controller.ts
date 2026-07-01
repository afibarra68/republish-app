import { Controller, Post, Body, Headers, UseGuards } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller()
export class WebhooksController {
  constructor(private webhooksService: WebhooksService) {}

  @UseGuards(JwtAuthGuard)
  @Post('connections')
  createConnection(
    @CurrentUser() user: { userId: string },
    @Body('provider') provider: string,
  ) {
    return this.webhooksService.createConnection(user.userId, provider || 'whatsapp');
  }

  @Public()
  @Post('webhooks/chat/:provider')
  handleChat(
    @Headers('x-publish-api-key') apiKey: string,
    @Body() body: { message: string; action?: string; draftId?: string },
  ) {
    if (body.action === 'publish' && body.draftId) {
      return this.webhooksService.confirmWhatsAppPublish(apiKey, body.draftId);
    }
    return this.webhooksService.handleWhatsAppMessage(apiKey, body.message);
  }
}
