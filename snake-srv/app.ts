import 'reflect-metadata';

import {InversifyExpressServer} from "inversify-express-utils";
import { interfaces as inversifyInterfaces } from 'inversify';
import {TYPES} from "./inversify/inversify-types";
import {container} from "./inversify/inversify-config";
import { Application } from 'express';
import * as bodyParser from 'body-parser';
import { Server as HttpServer } from 'http';
import {Logger} from "./util/logger";
import {AddressInfo} from "net";

export class App {
    private readonly server: InversifyExpressServer;
    private readonly container: inversifyInterfaces.Container;
    private readonly log: Logger;
    private readonly appName: string;
    private httpServer: HttpServer | undefined;

    public constructor(appName: string) {
        this.appName = appName;

        this.container = container;
        this.log = this.container.getNamed<Logger>(TYPES.Logger, 'app');
        this.server = this.container.get<() => InversifyExpressServer>(TYPES.InversifyExpressServerFactory)();

        this.server.setConfig((app: Application) => {
            app.disable('x-powered-by');
            app.set('json spaces', 2);

            app.set('json replacer', (key: string, value: unknown) => value ?? undefined);

            app.use(bodyParser.json({ type: ['json', '+json'], limit: 5 * 1024 * 1024 }));
        });

        this.server.setErrorConfig((app: Application) => {

        });
    }

    public async start(): Promise<void> {
        this.log.info(`${this.appName} starting...`);

        try {
            this.httpServer = this.server.build().listen(3000);
            this.log.info(`Server is listening on port ${(this.httpServer.address() as AddressInfo).port}. Leaving http server startup phase...`);
        } catch (e: unknown) {
            this.log.error(`Failed to start ${this.appName}`, { error: e });
            process.exit(1);
        }
    }
}

void new App('Snake Server').start();
