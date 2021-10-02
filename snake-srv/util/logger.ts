export interface LoggerLibrary {
    debug(message: string, ...meta: Array<unknown>): this;
    info(message: string, ...meta: Array<unknown>): this;
    warn(message: string, ...meta: Array<unknown>): this;
    error(message: string, ...meta: Array<unknown>): this;
    log(level: 'warn' | 'info' | 'debug' | 'error', message: string, ...meta: Array<unknown>): this;
}

export class Logger {
    private readonly upstream: LoggerLibrary | undefined;

    /**
     * Creates a new instance of Logger. This should not need to be called manually, except in
     * unit tests.
     *
     * @param upstream upstream logger library
     */
    public constructor(upstream?: LoggerLibrary) {
        if (upstream) {
            this.upstream = upstream;
        }
    }

    public debug(message: string, ...meta: Array<unknown>): this {
        this.upstream?.debug(message, ...meta);

        return this;
    }

    public info(message: string, ...meta: Array<unknown>): this {
        this.upstream?.info(message, ...meta);

        return this;
    }

    public warn(message: string, ...meta: Array<unknown>): this {
        this.upstream?.warn(message, ...meta);

        return this;
    }

    public error(message: string, ...meta: Array<unknown>): this {
        this.upstream?.error(message, ...meta);

        return this;
    }

    public log(level: 'warn' | 'info' | 'debug' | 'error', message: string, ...meta: Array<unknown>): this {
        this.upstream?.log(level, message, ...meta);

        return this;
    }
}
