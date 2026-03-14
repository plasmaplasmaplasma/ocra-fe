export type QueryValue = string | number | boolean | null | undefined;

export type ApiEnvelope<T> = {
  status: boolean;
  data: T;
  error: string | null;
};

export type PaginatedApiEnvelope<T> = ApiEnvelope<T[]> & {
  total: number;
  page: number;
  per_page: number;
};
