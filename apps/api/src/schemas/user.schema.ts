import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { GeoPoint, addLocationHooks } from './geo.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({ _id: false })
export class UserProfile {
  @Prop({ required: true, unique: true, index: true })
  username!: string;

  @Prop({ required: true })
  displayName!: string;

  @Prop({ default: '' })
  avatar!: string;

  @Prop({ default: '' })
  bio!: string;

  @Prop({ default: '' })
  website!: string;

  @Prop({ default: false })
  isVerified!: boolean;

  @Prop({ default: 0 })
  followerCount!: number;

  @Prop({ default: 0 })
  followingCount!: number;

  @Prop({ default: 0 })
  postCount!: number;

  @Prop({ type: [String], default: [] })
  interests!: string[];
}

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, unique: true, index: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ type: UserProfile, required: true })
  profile!: UserProfile;

  @Prop({ type: Object })
  location?: GeoPoint;

  @Prop({ default: null })
  apiKeyHash?: string;

  @Prop()
  refreshToken?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ 'profile.username': 1 }, { unique: true });
UserSchema.index({ location: '2dsphere' }, { sparse: true });
addLocationHooks(UserSchema);
