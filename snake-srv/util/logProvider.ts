import * as TransportStream from 'winston-transport';
import * as winston from 'winston';
import { injectable } from 'inversify';
import { Logger } from './logger';

@injectable()
export class LogProvider {
    private readonly logTransports: Array<TransportStream> = [];

    public constructor() {
        this.setupTransports();
    }

    // eslint-disable-next-line class-methods-use-this
    public createLogger(name: string): Logger {
        const addComponentToLogInfo = winston.format(info => {
            info.component = name;

            return info;
        });

        const makeErrorMessageAndCodeEnumerable = winston.format(info => {
            Object.values(info).filter(v => v instanceof Error).forEach((v: Error) => {
                ['message', 'code'].filter(p => v.hasOwnProperty(p)).forEach(p => {
                    Object.defineProperty(v, p, { enumerable: true });
                });
            });

            return info;
        });

        return new Logger(winston.loggers.get(name, {
            format: winston.format.combine(
                addComponentToLogInfo(),
                makeErrorMessageAndCodeEnumerable(),
                winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }),
                winston.format.timestamp(),
                winston.format.errors()
            )
        }));
    }

    private setupTransports(): void {
        this.setupConsoleTransport();

        this.logTransports.forEach(transport => transport.setMaxListeners(50));

        winston.loggers.options.transports = this.logTransports;
    }

    private setupConsoleTransport(): void {
        const consoleFormat = winston.format.printf(
            ({ level, message, timestamp, metadata }) =>
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions,@typescript-eslint/no-unsafe-argument
                `${timestamp} - ${level}: ${message} ${Object.keys(metadata).map(key => `${key}=${metadata[key]}`)}`
        );

        this.logTransports.push(
            new winston.transports.Console({
                level: 'debug',
                format: winston.format.combine(winston.format.colorize(), consoleFormat)
            })
        );
    }
}
