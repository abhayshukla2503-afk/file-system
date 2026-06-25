export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export interface StandardTimestampedEntity {
  createdAt: Date;
  updatedAt: Date;
}
