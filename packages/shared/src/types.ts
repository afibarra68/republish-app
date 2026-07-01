export interface AuthorSnapshot {
  username: string;
  displayName: string;
  avatar: string;
  isVerified: boolean;
  avgRating?: number;
}

export interface CommerceMetadata {
  brand?: string;
  model?: string;
  year?: number;
  km?: number;
  fuel?: string;
  condition?: string;
  warranty?: boolean;
  dishes?: string[];
  delivery?: boolean;
  validUntil?: string;
  duration?: string;
  coverage?: string;
  modality?: string;
  dimensions?: string;
  [key: string]: unknown;
}

export interface CommerceData {
  commerceType: string;
  category: string;
  price: number;
  currency: string;
  status: string;
  expiresAt?: Date;
  metadata?: CommerceMetadata;
}

export interface MediaItem {
  url: string;
  type: 'image' | 'video';
  order: number;
}

export interface PaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface DraftGenerated {
  caption: string;
  hashtags: string[];
  commerce: CommerceData;
}

export interface DraftPreview {
  draftId: string;
  caption: string;
  hashtags: string[];
  commerce: CommerceData;
  mediaUrls: string[];
  status: string;
}
