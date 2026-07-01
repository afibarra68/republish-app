import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { SocialGraphService } from './social-graph.service';
import { SocialGraphController } from './social-graph.controller';
import { Follow, FollowSchema } from '../../schemas/follow.schema';
import { Like, LikeSchema } from '../../schemas/like.schema';
import { Save, SaveSchema } from '../../schemas/save.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { Company, CompanySchema } from '../../schemas/company.schema';
import { Post, PostSchema } from '../../schemas/post.schema';
import { QUEUE_NAMES } from '@republish/shared';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Follow.name, schema: FollowSchema },
      { name: Like.name, schema: LikeSchema },
      { name: Save.name, schema: SaveSchema },
      { name: User.name, schema: UserSchema },
      { name: Company.name, schema: CompanySchema },
      { name: Post.name, schema: PostSchema },
    ]),
    BullModule.registerQueue(
      { name: QUEUE_NAMES.FEED_BACKFILL },
      { name: QUEUE_NAMES.NOTIFICATIONS },
    ),
  ],
  controllers: [SocialGraphController],
  providers: [SocialGraphService],
  exports: [SocialGraphService],
})
export class SocialGraphModule {}
