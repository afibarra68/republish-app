import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller()
export class ProfilesController {
  constructor(private profilesService: ProfilesService) {}

  @Public()
  @Get('users/:username')
  getUser(@Param('username') username: string) {
    return this.profilesService.getUserByUsername(username);
  }

  @Public()
  @Get('users/:username/posts')
  getUserPosts(
    @Param('username') username: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.profilesService.getUserPosts(username, cursor);
  }

  @Public()
  @Get('companies/:slug')
  getCompany(@Param('slug') slug: string) {
    return this.profilesService.getCompanyBySlug(slug);
  }

  @Public()
  @Get('companies/:slug/posts')
  getCompanyPosts(
    @Param('slug') slug: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.profilesService.getCompanyPosts(slug, cursor);
  }
}
