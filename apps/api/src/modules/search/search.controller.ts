import { Controller, Get, Param, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('explore')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Public()
  @Get('trending')
  trending(@Query('cursor') cursor?: string) {
    return this.searchService.trending(cursor);
  }

  @Public()
  @Get('category/:category')
  byCategory(@Param('category') category: string, @Query('cursor') cursor?: string) {
    return this.searchService.byCategory(category, cursor);
  }

  @Public()
  @Get('search/users')
  searchUsers(@Query('q') q: string) {
    return this.searchService.searchUsers(q);
  }
}
