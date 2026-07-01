export interface EdgeRankInput {
  likeCount: number;
  commentCount: number;
  saveCount: number;
  viewCount: number;
  publishedAt: Date;
  affinity?: number;
  proximityBoost?: number;
  categoryMatch?: number;
  commerceBoost?: number;
}

export function computeEdgeRank(input: EdgeRankInput): number {
  const weight =
    input.saveCount * 3 +
    input.commentCount * 2 +
    input.likeCount * 1 +
    input.viewCount * 0.1;

  const hoursSince =
    (Date.now() - new Date(input.publishedAt).getTime()) / (1000 * 60 * 60);
  const timeDecay = 1 / Math.pow(hoursSince + 2, 1.5);

  const affinity = input.affinity ?? 1;
  const proximity = input.proximityBoost ?? 0;
  const category = input.categoryMatch ?? 0;
  const commerce = input.commerceBoost ?? 0;

  return affinity * weight * timeDecay + proximity + category + commerce;
}

export function computeEngagementScore(input: Omit<EdgeRankInput, 'publishedAt' | 'affinity'>): number {
  return (
    input.likeCount +
    input.commentCount * 2 +
    input.saveCount * 3 +
    input.viewCount * 0.1
  );
}
