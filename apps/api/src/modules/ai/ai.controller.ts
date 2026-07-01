import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { CombinedAuthGuard } from '../auth/guards/combined-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('ai')
@UseGuards(CombinedAuthGuard)
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('generate-draft')
  generateDraft(
    @CurrentUser() user: { userId: string },
    @Body()
    body: {
      prompt: string;
      mediaUrls?: string[];
      price?: number;
      category?: string;
    },
  ) {
    return this.aiService.generateDraft(user.userId, body);
  }
}
