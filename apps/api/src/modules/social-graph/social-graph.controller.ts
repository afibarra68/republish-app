import { Controller, Post, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { SocialGraphService } from './social-graph.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class SocialGraphController {
  constructor(private socialGraph: SocialGraphService) {}

  @Post('users/:id/follow')
  followUser(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.socialGraph.follow(user.userId, id, 'user');
  }

  @Delete('users/:id/follow')
  unfollowUser(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.socialGraph.unfollow(user.userId, id, 'user');
  }

  @Post('companies/:id/follow')
  followCompany(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.socialGraph.follow(user.userId, id, 'company');
  }

  @Delete('companies/:id/follow')
  unfollowCompany(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.socialGraph.unfollow(user.userId, id, 'company');
  }

  @Post('posts/:id/like')
  like(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.socialGraph.like(user.userId, id);
  }

  @Delete('posts/:id/like')
  unlike(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.socialGraph.unlike(user.userId, id);
  }

  @Post('posts/:id/save')
  save(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.socialGraph.save(user.userId, id);
  }

  @Delete('posts/:id/save')
  unsave(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.socialGraph.unsave(user.userId, id);
  }

  @Get('social/suggestions')
  suggestions(@CurrentUser() user: { userId: string }) {
    return this.socialGraph.getSuggestions(user.userId);
  }

  @Get('social/following')
  following(@CurrentUser() user: { userId: string }) {
    return this.socialGraph.getFollowing(user.userId);
  }
}
