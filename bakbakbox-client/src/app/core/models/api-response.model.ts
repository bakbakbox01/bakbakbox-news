export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedData<T> {
  pagination: PaginationMeta;
  [key: string]: T[] | PaginationMeta;
}
