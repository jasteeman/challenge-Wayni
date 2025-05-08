export interface IApiResponse<T> {
    data: {
      data: T[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }