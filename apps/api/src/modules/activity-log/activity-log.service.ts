import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ActivityLog, ActivityLogDocument } from '../../schemas/activity-log.schema';
import { ActivityAction } from '@republish/shared';

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectModel(ActivityLog.name)
    private logModel: Model<ActivityLogDocument>,
  ) {}

  async log(
    actorId: string,
    action: ActivityAction | string,
    targetType: string,
    targetId?: string,
    metadata: Record<string, unknown> = {},
  ) {
    await this.logModel.create({
      actorId: new Types.ObjectId(actorId),
      action,
      targetType,
      targetId: targetId ? new Types.ObjectId(targetId) : undefined,
      metadata,
    });
  }
}
