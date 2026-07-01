import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { User, UserSchema } from '../../schemas/user.schema';
import { CombinedAuthGuard } from '../auth/guards/combined-auth.guard';
import { QUEUE_NAMES } from '@republish/shared';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    BullModule.registerQueue({ name: QUEUE_NAMES.MEDIA_PROCESS }),
  ],
  controllers: [MediaController],
  providers: [MediaService, CombinedAuthGuard],
  exports: [MediaService],
})
export class MediaModule {}
