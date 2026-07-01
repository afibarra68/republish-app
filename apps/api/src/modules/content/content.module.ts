import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { Post, PostSchema } from '../../schemas/post.schema';
import { PostDraft, PostDraftSchema } from '../../schemas/post-draft.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { Company, CompanySchema } from '../../schemas/company.schema';
import { Comment, CommentSchema } from '../../schemas/comment.schema';
import { QUEUE_NAMES } from '@republish/shared';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: PostDraft.name, schema: PostDraftSchema },
      { name: User.name, schema: UserSchema },
      { name: Company.name, schema: CompanySchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
    BullModule.registerQueue(
      { name: QUEUE_NAMES.FEED_FANOUT },
      { name: QUEUE_NAMES.NOTIFICATIONS },
    ),
    AuthModule,
  ],
  controllers: [ContentController],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}
