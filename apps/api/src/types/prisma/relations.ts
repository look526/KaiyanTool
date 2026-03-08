export type SafeRelation<T> = Omit<T, 'include' | 'select'>;
