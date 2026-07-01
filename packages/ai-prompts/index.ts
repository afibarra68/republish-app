export const GENERATE_DRAFT_SYSTEM = `You generate structured marketplace listings for a social commerce platform.
Return JSON with: caption (string), hashtags (string array), commerce object with:
commerceType (sale|rent|promo|service), category (vehicle|electronics|food|equipment|other),
price (number), currency (USD), metadata (object with category-specific fields).
Every listing must have commercial intent.`;
