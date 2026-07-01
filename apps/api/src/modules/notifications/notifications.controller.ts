import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  inbox(@CurrentUser() user: { userId: string }) {
    return this.notificationsService.getInbox(user.userId);
  }

  @Patch(':id/read')
  markRead(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.notificationsService.markRead(user.userId, id);
  }

  @Patch('read-all')
  markAllRead(@CurrentUser() user: { userId: string }) {
    return this.notificationsService.markAllRead(user.userId);
  }
}
