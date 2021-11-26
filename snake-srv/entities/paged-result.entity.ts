export class PagedResult<T> {
    public data: Array<T>;
    public count: number;
    public limit: number;
    public offset: number;

    public constructor(data: Array<T>, count: number, limit: number, offset: number) {
        this.data = data;
        this.count = count;
        this.limit = limit;
        this.offset = offset;
    }
}
