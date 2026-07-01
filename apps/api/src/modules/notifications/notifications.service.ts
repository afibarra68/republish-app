import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from '../../schemas/notification.schema';
import { Follow, FollowDocument } from '../../schemas/follow.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { NotificationType } from '@republish/shared';
import { PushService } from './push.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notifModel: Model<NotificationDocument>,
    @InjectModel(Follow.name) private followModel: Model<FollowDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private pushService: PushService,
  ) {}

  async create(userId: string, type: string, payload: Record<string, unknown>) {
    const notification = await this.notifModel.create({
      userId: new Types.ObjectId(userId),
      type,
      payload,
      read: false,
    });

    const title = this.titleForType(type, payload);
    const body = this.bodyForType(type, payload);
    await this.pushService.send(userId, title, body, {
      type,
      notificationId: notification._id.toString(),
    });

    return notification;
  }

  private titleForType(type: string, payload: Record<string, unknown>) {
    switch (type) {
      case NotificationType.LIKE:
        return `${payload.likerName || 'Alguien'} le gustó tu publicación`;
      case NotificationType.COMMENT:
        return `${payload.commenterName || 'Alguien'} comentó tu publicación`;
      case NotificationType.FOLLOW:
        return `${payload.followerName || 'Alguien'} empezó a seguirte`;
      case NotificationType.NEW_POST:
        return `${payload.authorName || 'Alguien'} publicó algo nuevo`;
      default:
        return 'Publish';
    }
  }

  private bodyForType(type: string, payload: Record<string, unknown>) {
    if (type === NotificationType.COMMENT && payload.text) {
      return String(payload.text).slice(0, 120);
    }
    return 'Toca para ver en Publish';
  }

  async notifyPostPublished(authorId: string, postId: string) {
    const followers = await this.followModel
      .find({ followingId: new Types.ObjectId(authorId) })
      .limit(1000)
      .lean();

    const author = await this.userModel.findById(authorId).lean();

    for (const f of followers) {
      await this.create(f.followerId.toString(), NotificationType.NEW_POST, {
        postId,
        authorId,
        authorName: author?.profile.displayName,
      });
    }
  }

  async notifyLike(authorId: string, likerId: string, postId: string) {
    if (authorId === likerId) return;
    const liker = await this.userModel.findById(likerId).lean();
    await this.create(authorId, NotificationType.LIKE, {
      postId,
      likerId,
      likerName: liker?.profile.displayName,
    });
  }

  async notifyFollow(followingId: string, followerId: string) {
    const follower = await this.userModel.findById(followerId).lean();
    await this.create(followingId, NotificationType.FOLLOW, {
      followerId,
      followerName: follower?.profile.displayName,
    });
  }

  async notifyComment(authorId: string, commenterId: string, postId: string, text: string) {
    if (authorId === commenterId) return;
    const commenter = await this.userModel.findById(commenterId).lean();
    await this.create(authorId, NotificationType.COMMENT, {
      postId,
      commenterId,
      commenterName: commenter?.profile.displayName,
      text,
    });
  }

  async getInbox(userId: string, limit = 50) {
    return this.notifModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async markRead(userId: string, notificationId: string) {
    await this.notifModel.updateOne(
      { _id: new Types.ObjectId(notificationId), userId: new Types.ObjectId(userId) },
      { read: true },
    );
    return { read: true };
  }

  async markAllRead(userId: string) {
    await this.notifModel.updateMany(
      { userId: new Types.ObjectId(userId), read: false },
      { read: true },
    );
    return { read: true };
  }
}
