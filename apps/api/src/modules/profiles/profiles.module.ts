import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { User, UserSchema } from '../../schemas/user.schema';
import { Company, CompanySchema } from '../../schemas/company.schema';
import { Post, PostSchema } from '../../schemas/post.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Company.name, schema: CompanySchema },
      { name: Post.name, schema: PostSchema },
    ]),
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
