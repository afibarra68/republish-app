import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiKeyGuard } from './guards/api-key.guard';
import { CombinedAuthGuard } from './guards/combined-auth.guard';
import { User, UserSchema } from '../../schemas/user.schema';
import { ActivityLogModule } from '../activity-log/activity-log.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET', 'dev-secret'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN', '7d') },
      }),
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ActivityLogModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, ApiKeyGuard, CombinedAuthGuard],
  exports: [AuthService, JwtAuthGuard, ApiKeyGuard, CombinedAuthGuard, JwtModule, MongooseModule],
})
export class AuthModule {}
