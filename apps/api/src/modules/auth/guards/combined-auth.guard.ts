import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { User, UserDocument } from '../../../schemas/user.schema';

@Injectable()
export class CombinedAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-publish-api-key'] as string;

    if (apiKey) {
      const users = await this.userModel.find({ apiKeyHash: { $ne: null } }).lean();
      for (const user of users) {
        if (user.apiKeyHash && (await bcrypt.compare(apiKey, user.apiKeyHash))) {
          request.user = {
            userId: user._id.toString(),
            email: user.email,
            profile: user.profile,
          };
          return true;
        }
      }
      throw new UnauthorizedException('Invalid API key');
    }

    try {
      const result = await super.canActivate(context);
      return result as boolean;
    } catch {
      throw new UnauthorizedException('Authentication required');
    }
  }
}
