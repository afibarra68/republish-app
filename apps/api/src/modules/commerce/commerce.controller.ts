import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { CommerceService } from './commerce.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller()
export class CommerceController {
  constructor(private commerceService: CommerceService) {}

  @UseGuards(JwtAuthGuard)
  @Post('companies')
  createCompany(
    @CurrentUser() user: { userId: string },
    @Body() body: { name: string; slug: string; category?: string; contactInfo?: Record<string, string> },
  ) {
    return this.commerceService.createCompany(user.userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('companies/:id/ratings')
  addRating(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() body: { score: number; comment: string },
  ) {
    return this.commerceService.addRating(user.userId, id, body.score, body.comment);
  }

  @Public()
  @Get('companies/:id/ratings')
  getRatings(@Param('id') id: string) {
    return this.commerceService.getRatings(id);
  }
}
