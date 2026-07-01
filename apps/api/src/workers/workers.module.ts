import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import {
  FeedFanoutProcessor,
  FeedBackfillProcessor,
  NotificationsProcessor,
  MediaProcessProcessor,
} from './workers.processors';
import { FeedModule } from '../modules/feed/feed.module';
import { NotificationsModule } from '../modules/notifications/notifications.module';
import { QUEUE_NAMES } from '@republish/shared';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: QUEUE_NAMES.FEED_FANOUT },
      { name: QUEUE_NAMES.FEED_BACKFILL },
      { name: QUEUE_NAMES.NOTIFICATIONS },
      { name: QUEUE_NAMES.MEDIA_PROCESS },
    ),
    FeedModule,
    NotificationsModule,
  ],
  providers: [
    FeedFanoutProcessor,
    FeedBackfillProcessor,
    NotificationsProcessor,
    MediaProcessProcessor,
  ],
})
export class WorkersModule {}
