import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { AuthModule } from './modules/auth/auth.module';
import { SocialGraphModule } from './modules/social-graph/social-graph.module';
import { ContentModule } from './modules/content/content.module';
import { FeedModule } from './modules/feed/feed.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { MediaModule } from './modules/media/media.module';
import { CommerceModule } from './modules/commerce/commerce.module';
import { AiModule } from './modules/ai/ai.module';
import { SearchModule } from './modules/search/search.module';
import { ActivityLogModule } from './modules/activity-log/activity-log.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { StoriesModule } from './modules/stories/stories.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { HealthController } from './gateway/health.controller';
import { WorkersModule } from './workers/workers.module';
import { CombinedAuthGuard } from './modules/auth/guards/combined-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI', 'mongodb://localhost:27017/publish'),
      }),
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: new URL(config.get('REDIS_URL', 'redis://localhost:6379')).hostname,
          port: parseInt(new URL(config.get('REDIS_URL', 'redis://localhost:6379')).port || '6379', 10),
        },
      }),
    }),
    AuthModule,
    ProfilesModule,
    SocialGraphModule,
    ContentModule,
    FeedModule,
    NotificationsModule,
    MediaModule,
    CommerceModule,
    AiModule,
    SearchModule,
    ActivityLogModule,
    StoriesModule,
    WebhooksModule,
    WorkersModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: CombinedAuthGuard }],
})
export class AppModule {}
