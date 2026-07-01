import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StoriesService } from './stories.service';
import { StoriesController } from './stories.controller';
import { Story, StorySchema } from '../../schemas/story.schema';
import { Follow, FollowSchema } from '../../schemas/follow.schema';
import { Company, CompanySchema } from '../../schemas/company.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Story.name, schema: StorySchema },
      { name: Follow.name, schema: FollowSchema },
      { name: Company.name, schema: CompanySchema },
    ]),
  ],
  controllers: [StoriesController],
  providers: [StoriesService],
  exports: [StoriesService],
})
export class StoriesModule {}
