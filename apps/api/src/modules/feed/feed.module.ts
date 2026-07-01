import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedService } from './feed.service';
import { FeedController } from './feed.controller';
import { FeedTimeline, FeedTimelineSchema } from '../../schemas/feed-timeline.schema';
import { Post, PostSchema } from '../../schemas/post.schema';
import { Follow, FollowSchema } from '../../schemas/follow.schema';
import { User, UserSchema } from '../../schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FeedTimeline.name, schema: FeedTimelineSchema },
      { name: Post.name, schema: PostSchema },
      { name: Follow.name, schema: FollowSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [FeedController],
  providers: [FeedService],
  exports: [FeedService],
})
export class FeedModule {}
