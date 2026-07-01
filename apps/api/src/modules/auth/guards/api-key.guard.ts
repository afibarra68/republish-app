import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../../../schemas/user.schema';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-publish-api-key'] as string;
    if (!apiKey) throw new UnauthorizedException('API key required');

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
}
