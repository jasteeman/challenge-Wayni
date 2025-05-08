import { paginate, PaginationOptions } from "./paginations.utils";

describe('paginate', () => {
  const mockData = Array.from({ length: 30 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }));

  it('should return the first page with default options', () => {
    const options: PaginationOptions = {};
    const result = paginate(mockData, options);
    expect(result.data).toHaveLength(10);
    expect(result.data[0]).toEqual({ id: 1, name: 'Item 1' });
    expect(result.data[9]).toEqual({ id: 10, name: 'Item 10' });
    expect(result.total).toBe(30);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.totalPages).toBe(3);
  });

  it('should return the specified page', () => {
    const options: PaginationOptions = { page: 2 };
    const result = paginate(mockData, options);
    expect(result.data).toHaveLength(10);
    expect(result.data[0]).toEqual({ id: 11, name: 'Item 11' });
    expect(result.data[9]).toEqual({ id: 20, name: 'Item 20' });
    expect(result.total).toBe(30);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(10);
    expect(result.totalPages).toBe(3);
  });

  it('should return the specified limit per page', () => {
    const options: PaginationOptions = { limit: 5 };
    const result = paginate(mockData, options);
    expect(result.data).toHaveLength(5);
    expect(result.data[0]).toEqual({ id: 1, name: 'Item 1' });
    expect(result.data[4]).toEqual({ id: 5, name: 'Item 5' });
    expect(result.total).toBe(30);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(5);
    expect(result.totalPages).toBe(6);
  });

  it('should return the correct page with a specified limit', () => {
    const options: PaginationOptions = { page: 3, limit: 7 };
    const result = paginate(mockData, options);
    expect(result.data).toHaveLength(7);
    expect(result.data[0]).toEqual({ id: 15, name: 'Item 15' });
    expect(result.data[6]).toEqual({ id: 21, name: 'Item 21' });
    expect(result.total).toBe(30);
    expect(result.page).toBe(3);
    expect(result.limit).toBe(7);
    expect(result.totalPages).toBe(5);
  });

  it('should return an empty array if the page is out of bounds (greater than totalPages)', () => {
    const options: PaginationOptions = { page: 10 };
    const result = paginate(mockData, options);
    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(30);
    expect(result.page).toBe(10);
    expect(result.limit).toBe(10);
    expect(result.totalPages).toBe(3);
  });

  it('should return the last page correctly when it is not a full page', () => {
    const optionsSmallLimitPage5: PaginationOptions = { page: 5, limit: 5 };
    const resultSmallLimitPage5 = paginate(mockData, optionsSmallLimitPage5);
    expect(resultSmallLimitPage5.data).toHaveLength(5);
    expect(resultSmallLimitPage5.data[0]).toEqual({ id: 21, name: 'Item 21' });
    expect(resultSmallLimitPage5.data[4]).toEqual({ id: 25, name: 'Item 25' });
    expect(resultSmallLimitPage5.total).toBe(30);
    expect(resultSmallLimitPage5.page).toBe(5);
    expect(resultSmallLimitPage5.limit).toBe(5);
    expect(resultSmallLimitPage5.totalPages).toBe(6);

    const optionsSmallLimitPage6: PaginationOptions = { page: 6, limit: 5 };
    const resultSmallLimitPage6 = paginate(mockData, optionsSmallLimitPage6);
    expect(resultSmallLimitPage6.data).toHaveLength(5);
    expect(resultSmallLimitPage6.data[0]).toEqual({ id: 26, name: 'Item 26' });
    expect(resultSmallLimitPage6.data[4]).toEqual({ id: 30, name: 'Item 30' });
    expect(resultSmallLimitPage6.total).toBe(30);
    expect(resultSmallLimitPage6.page).toBe(6);
    expect(resultSmallLimitPage6.limit).toBe(5);
    expect(resultSmallLimitPage6.totalPages).toBe(6);
  });

  it('should handle an empty data array', () => {
    const options: PaginationOptions = {};
    const result = paginate([], options);
    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.totalPages).toBe(0);
  });

  it('should handle page 0 or less by defaulting to page 1', () => {
    const optionsPageZero: PaginationOptions = { page: 1 };
    const resultPageZero = paginate(mockData, optionsPageZero);
    expect(resultPageZero.page).toBe(1);

    const optionsNegativePage: PaginationOptions = { page: -1 };
    const resultNegativePage = paginate(mockData, optionsNegativePage);
    expect(resultNegativePage.page).toBe(1);
  });

  it('should handle limit 0 or less by defaulting to limit 10', () => {
    const optionsLimitZero: PaginationOptions = { limit: 10 };
    const resultLimitZero = paginate(mockData, optionsLimitZero);
    expect(resultLimitZero.limit).toBe(10);
    expect(resultLimitZero.totalPages).toBe(3);

    const optionsNegativeLimit: PaginationOptions = { limit: -5 };
    const resultNegativeLimit = paginate(mockData, optionsNegativeLimit);
    expect(resultNegativeLimit.limit).toBe(10);
    expect(resultNegativeLimit.totalPages).toBe(3);
  });

  it('should not filter based on the "q" parameter', () => {
    const options: PaginationOptions = { q: 'Item 5' };
    const result = paginate(mockData, options);
    expect(result.data).toHaveLength(10);
    expect(result.total).toBe(30);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.totalPages).toBe(3);
  });
});