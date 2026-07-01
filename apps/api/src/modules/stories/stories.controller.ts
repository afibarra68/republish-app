import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { StoriesService } from './stories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('stories')
@UseGuards(JwtAuthGuard)
export class StoriesController {
  constructor(private storiesService: StoriesService) {}

  @Post()
  create(
    @CurrentUser() user: { userId: string },
    @Body() body: { mediaUrl: string; mediaType?: string; caption?: string; authorType?: 'user' | 'company' },
  ) {
    return this.storiesService.create(
      user.userId,
      body.authorType || 'user',
      body,
    );
  }

  @Get('feed')
  feed(@CurrentUser() user: { userId: string }) {
    return this.storiesService.getFeed(user.userId);
  }

  @Post(':id/view')
  view(@Param('id') id: string) {
    return this.storiesService.recordView(id);
  }
}
