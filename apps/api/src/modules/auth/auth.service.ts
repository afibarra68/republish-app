import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserDocument } from '../../schemas/user.schema';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private activityLog: ActivityLogService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userModel.findOne({
      $or: [{ email: dto.email }, { 'profile.username': dto.username }],
    });
    if (existing) throw new ConflictException('Email or username already exists');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.userModel.create({
      email: dto.email,
      passwordHash,
      profile: {
        username: dto.username,
        displayName: dto.displayName,
        avatar: '',
        bio: '',
        website: '',
        isVerified: false,
        followerCount: 0,
        followingCount: 0,
        postCount: 0,
        interests: [],
      },
    });

    const token = this.signToken(user._id.toString(), user.email);
    return { user: this.sanitize(user), accessToken: token };
  }

  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = this.signToken(user._id.toString(), user.email);
    return { user: this.sanitize(user), accessToken: token };
  }

  async generateApiKey(userId: string) {
    const apiKey = `pub_${crypto.randomBytes(32).toString('hex')}`;
    const apiKeyHash = await bcrypt.hash(apiKey, 10);
    await this.userModel.findByIdAndUpdate(userId, { apiKeyHash });
    return { apiKey };
  }

  private signToken(sub: string, email: string) {
    return this.jwtService.sign({ sub, email });
  }

  private sanitize(user: UserDocument) {
    return {
      id: user._id.toString(),
      email: user.email,
      profile: user.profile,
    };
  }
}
