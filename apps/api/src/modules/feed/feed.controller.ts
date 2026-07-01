import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { FeedService } from './feed.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('feed')
export class FeedController {
  constructor(private feedService: FeedService) {}

  @UseGuards(JwtAuthGuard)
  @Get('following')
  following(
    @CurrentUser() user: { userId: string },
    @Query('cursor') cursor?: string,
  ) {
    return this.feedService.getFollowingFeed(user.userId, cursor);
  }

  @Public()
  @Get('for-you')
  forYou(@Query('cursor') cursor?: string) {
    return this.feedService.getForYouFeed('anonymous', cursor);
  }

  @Public()
  @Get('nearby')
  nearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.feedService.getNearbyFeed(
      parseFloat(lat),
      parseFloat(lng),
      radius ? parseInt(radius, 10) : 10,
      cursor,
    );
  }
}
