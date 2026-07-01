import { Schema } from 'mongoose';

export const GeoPointSchema = new Schema(
  {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true, validate: [(v: number[]) => v.length === 2, 'coordinates must be [lng, lat]'] },
  },
  { _id: false },
);

export type GeoPoint = { type: 'Point'; coordinates: [number, number] };

export function stripInvalidLocation(doc: { location?: unknown }) {
  const loc = doc.location as GeoPoint | undefined;
  if (
    !loc ||
    loc.type !== 'Point' ||
    !Array.isArray(loc.coordinates) ||
    loc.coordinates.length !== 2
  ) {
    delete doc.location;
  }
}

export function addLocationHooks(schema: Schema) {
  schema.pre('save', function (next) {
    stripInvalidLocation(this as { location?: unknown });
    next();
  });
  schema.pre('insertMany', function (next, docs: Array<{ location?: unknown }>) {
    for (const doc of docs) stripInvalidLocation(doc);
    next();
  });
}
