import 'reflect-metadata';

import {InversifyExpressServer} from "inversify-express-utils";
import {interfaces as inversifyInterfaces} from 'inversify';
import {TYPES} from "./inversify/inversify-types";
import {container} from "./inversify/inversify-config";
import {Application, NextFunction, Response, Request} from 'express';
import * as bodyParser from 'body-parser';
import { Server as HttpServer } from 'http';
import {Logger} from "./util/logger";
import {AddressInfo} from "net";
import {Config} from "./util/config";
import {Database} from "./db/database";
import cors from 'cors';
import { UserRepository } from "./db/repositories/user.repository";
import {InternalServerError, PathNotFoundError, ProblemJsonError} from "./util/problem-json-errors";


export class App {
    private readonly server: InversifyExpressServer;
    private readonly container: inversifyInterfaces.Container;
    private readonly log: Logger;
    private database: Database | undefined;
    private userRepository: UserRepository | undefined;
    private app: Application | undefined;

    private httpServer: HttpServer | undefined;

    public constructor(private readonly appName: string, private readonly config: Config) {
        this.container = container;
        this.log = this.container.getNamed<Logger>(TYPES.Logger, 'app');
        this.server = this.container.get<() => InversifyExpressServer>(TYPES.InversifyExpressServerFactory)();
    }

    public async start(): Promise<void> {
        this.log.info(`${this.appName} starting...`);

        try {
            this.log.info('Start connecting to database...');
            this.database = this.container.get<Database>(TYPES.Database);
            await this.database.connect();
            this.userRepository = this.container.get<UserRepository>(TYPES.UserRepository);
            this.log.info('Successful connecting to database.');
            this.server.setConfig((app: Application) => {
                app.disable('x-powered-by');
                app.use(cors());
                app.set('json spaces', 2);

                app.set('json replacer', (key: string, value: unknown) => value ?? undefined);

                app.use(bodyParser.json({ type: ['json', '+json'], limit: 5 * 1024 * 1024 }));
            });

            this.server.setErrorConfig((app: Application) => {
                app.use((req: Request, res: Response, next: NextFunction) => {
                    next(new PathNotFoundError(req.path));
                });

                app.use((error: ProblemJsonError | Error, req: Request, res: Response, next: NextFunction) => {
                    if (res.headersSent) {
                        // headers were already sent, delegate to default express error handler (closes connection)
                        next(error);

                        return;
                    }

                    if (error instanceof ProblemJsonError) {
                        res.status(error.status).json(error);

                        return;
                    }

                    this.log.error('Unhandled error', { error });
                    res.status(500).json(new InternalServerError());
                });
            });

            this.httpServer = this.server.build().listen(this.config.config.webServer.port);
            this.log.info(`Server is listening on port ${(this.httpServer.address() as AddressInfo).port}. Leaving http server startup phase...`);
        } catch (e: unknown) {
            this.log.error(`Failed to start ${this.appName}`, { error: e });
            process.exit(1);
        }
    }
}

void new App('Snake Server', new Config()).start();
