import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { ContentModule } from '../content/content.module';
import { User, UserSchema } from '../../schemas/user.schema';
import { CombinedAuthGuard } from '../auth/guards/combined-auth.guard';

@Module({
  imports: [
    ContentModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AiController],
  providers: [AiService, CombinedAuthGuard],
  exports: [AiService],
})
export class AiModule {}
