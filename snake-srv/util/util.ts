export class ResponseError extends Error {
    public constructor(msg: string, public readonly code: number) {
        super(msg);
    }
}
