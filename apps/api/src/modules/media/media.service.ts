import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { QUEUE_NAMES, EVENT_NAMES } from '@republish/shared';

@Injectable()
export class MediaService {
  private uploadDir: string;
  private baseUrl: string;

  constructor(
    private config: ConfigService,
    @InjectQueue(QUEUE_NAMES.MEDIA_PROCESS) private mediaQueue: Queue,
  ) {
    this.uploadDir = config.get('UPLOAD_DIR', './uploads');
    this.baseUrl = config.get('MEDIA_BASE_URL', 'http://localhost:3000/uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFiles(files: Express.Multer.File[], userId: string) {
    const urls: string[] = [];

    for (const file of files) {
      const ext = path.extname(file.originalname) || '.jpg';
      const filename = `${uuidv4()}${ext}`;
      const filepath = path.join(this.uploadDir, filename);
      fs.writeFileSync(filepath, file.buffer);
      const url = `${this.baseUrl}/${filename}`;
      urls.push(url);

      await this.mediaQueue.add(EVENT_NAMES.MEDIA_UPLOADED, {
        url,
        userId,
        filename,
      });
    }

    return { mediaUrls: urls };
  }
}
