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
export declare function computeEdgeRank(input: EdgeRankInput): number;
export declare function computeEngagementScore(input: Omit<EdgeRankInput, 'publishedAt' | 'affinity'>): number;
