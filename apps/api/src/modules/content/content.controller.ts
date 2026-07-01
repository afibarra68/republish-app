import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CombinedAuthGuard } from '../auth/guards/combined-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller()
export class ContentController {
  constructor(private contentService: ContentService) {}

  @Public()
  @Get('posts/:id')
  getPost(@Param('id') id: string) {
    return this.contentService.getPost(id);
  }

  @Public()
  @Post('posts/:id/view')
  viewPost(@Param('id') id: string) {
    return this.contentService.recordView(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('posts/:id/share')
  sharePost(@Param('id') id: string) {
    return this.contentService.share(id);
  }

  @UseGuards(CombinedAuthGuard)
  @Get('drafts')
  listDrafts(@CurrentUser() user: { userId: string }) {
    return this.contentService.listDrafts(user.userId);
  }

  @UseGuards(CombinedAuthGuard)
  @Get('drafts/:id')
  getDraft(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.contentService.getDraft(user.userId, id);
  }

  @UseGuards(CombinedAuthGuard)
  @Patch('drafts/:id')
  updateDraft(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() body: { caption?: string; price?: number; hashtags?: string[] },
  ) {
    return this.contentService.updateDraft(user.userId, id, body);
  }

  @UseGuards(CombinedAuthGuard)
  @Post('drafts/:id/publish')
  publishDraft(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.contentService.publishDraft(user.userId, id);
  }

  @UseGuards(CombinedAuthGuard)
  @Delete('drafts/:id')
  cancelDraft(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.contentService.cancelDraft(user.userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('posts/:id/comments')
  addComment(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body('text') text: string,
  ) {
    return this.contentService.addComment(user.userId, id, text);
  }

  @Public()
  @Get('posts/:id/comments')
  getComments(@Param('id') id: string, @Query('cursor') cursor?: string) {
    return this.contentService.getComments(id, cursor);
  }
}
