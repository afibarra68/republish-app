import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { FeedService } from '../modules/feed/feed.service';
import { NotificationsService } from '../modules/notifications/notifications.service';
import { QUEUE_NAMES, EVENT_NAMES } from '@republish/shared';

@Processor(QUEUE_NAMES.FEED_FANOUT)
export class FeedFanoutProcessor extends WorkerHost {
  constructor(private feedService: FeedService) {
    super();
  }

  async process(job: Job) {
    if (job.name === EVENT_NAMES.POST_PUBLISHED) {
      const { postId, authorId, followerCount } = job.data as {
        postId: string;
        authorId: string;
        followerCount: number;
      };
      return this.feedService.fanOut(postId, authorId, followerCount);
    }
  }
}

@Processor(QUEUE_NAMES.FEED_BACKFILL)
export class FeedBackfillProcessor extends WorkerHost {
  constructor(private feedService: FeedService) {
    super();
  }

  async process(job: Job) {
    if (job.name === EVENT_NAMES.USER_FOLLOWED) {
      const { followerId, followingId } = job.data as {
        followerId: string;
        followingId: string;
      };
      return this.feedService.backfillTimeline(followerId, followingId);
    }
  }
}

@Processor(QUEUE_NAMES.NOTIFICATIONS)
export class NotificationsProcessor extends WorkerHost {
  constructor(private notificationsService: NotificationsService) {
    super();
  }

  async process(job: Job) {
    if (job.name === EVENT_NAMES.POST_PUBLISHED) {
      const { authorId, postId } = job.data as { authorId: string; postId: string };
      return this.notificationsService.notifyPostPublished(authorId, postId);
    }
    if (job.name === EVENT_NAMES.POST_LIKED) {
      const { authorId, likerId, postId } = job.data as {
        authorId: string;
        likerId: string;
        postId: string;
      };
      return this.notificationsService.notifyLike(authorId, likerId, postId);
    }
    if (job.name === EVENT_NAMES.USER_FOLLOWED) {
      const { followerId, followingId } = job.data as {
        followerId: string;
        followingId: string;
      };
      return this.notificationsService.notifyFollow(followingId, followerId);
    }
    if (job.name === 'comment.created') {
      const { authorId, commenterId, postId, text } = job.data as {
        authorId: string;
        commenterId: string;
        postId: string;
        text: string;
      };
      return this.notificationsService.notifyComment(authorId, commenterId, postId, text);
    }
  }
}

@Processor(QUEUE_NAMES.MEDIA_PROCESS)
export class MediaProcessProcessor extends WorkerHost {
  async process(job: Job) {
    // MVP: media already stored locally; future: resize, thumbnails, CDN upload
    return { processed: true, url: (job.data as { url: string }).url };
  }
}
