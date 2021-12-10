export interface PagedResult<T> {
  data: Array<T>;
  count: number;
  limit: number;
  offset: number;
}
