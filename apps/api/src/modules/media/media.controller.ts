import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { CombinedAuthGuard } from '../auth/guards/combined-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('media')
@UseGuards(CombinedAuthGuard)
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 10))
  upload(
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: { userId: string },
  ) {
    return this.mediaService.uploadFiles(files || [], user.userId);
  }
}
