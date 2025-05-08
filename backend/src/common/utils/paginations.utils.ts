// src/common/pagination.util.ts

export interface PaginationOptions {
  page?: number;
  limit?: number;
  q?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function paginate<T>(
  data: T[],
  options: PaginationOptions,
): PaginatedResult<T> {
  let { page = 1, limit = 10 } = options;

  if (page <= 0) {
    page = 1;
  }
  if (limit <= 0) {
    limit = 10;
  }

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const results = data.slice(startIndex, endIndex);
  const total = data.length;
  const totalPages = Math.ceil(total / limit);

  return {
    data: results,
    total,
    page,
    limit,
    totalPages,
  };
}