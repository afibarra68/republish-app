const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function api<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

export interface Post {
  _id: string;
  caption: string;
  authorSnapshot: { username: string; displayName: string; avatar: string; isVerified: boolean };
  media: { url: string; type: string }[];
  commerce?: { price: number; currency: string; category: string; commerceType: string };
  likeCount: number;
  commentCount: number;
  saveCount: number;
  viewCount?: number;
}

export interface FeedResponse {
  items: Post[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface Notification {
  _id: string;
  type: string;
  payload: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

export interface UserProfileResponse {
  id: string;
  profile: {
    username: string;
    displayName: string;
    avatar: string;
    followerCount: number;
    followingCount: number;
    postCount: number;
  };
}

export function getFeed(type: 'for-you' | 'following' = 'for-you', token?: string) {
  return api<FeedResponse>(`/feed/${type}`, {}, token);
}

export function getPost(id: string) {
  return api<Post>(`/posts/${id}`);
}

export function recordView(id: string) {
  return api<{ viewed: boolean }>(`/posts/${id}/view`, { method: 'POST' });
}

export function getNotifications(token: string) {
  return api<Notification[]>(`/notifications`, {}, token);
}

export function getUserProfile(username: string) {
  return api<UserProfileResponse>(`/users/${username}`);
}

export function getUserPosts(username: string) {
  return api<FeedResponse>(`/users/${username}/posts`);
}

export function formatNotification(n: Notification): string {
  const p = n.payload;
  switch (n.type) {
    case 'like':
      return `${p.likerName || 'Alguien'} le gustó tu publicación`;
    case 'comment':
      return `${p.commenterName || 'Alguien'} comentó: ${String(p.text || '').slice(0, 60)}`;
    case 'follow':
      return `${p.followerName || 'Alguien'} empezó a seguirte`;
    case 'new_post':
      return `${p.authorName || 'Alguien'} publicó algo nuevo`;
    default:
      return 'Nueva actividad en Publish';
  }
}
