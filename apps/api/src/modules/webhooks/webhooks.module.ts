import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { ExternalConnection, ExternalConnectionSchema } from '../../schemas/external-connection.schema';
import { AiModule } from '../ai/ai.module';
import { ContentModule } from '../content/content.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExternalConnection.name, schema: ExternalConnectionSchema },
    ]),
    AiModule,
    ContentModule,
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule {}
