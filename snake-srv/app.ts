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
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import {Strategy as LocalStrategy} from "passport-local";
import { BasicStrategy } from 'passport-http';
import {User} from "./entities/user.entity";
import crypto from "crypto";
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
                app.set('json spaces', 2);

                app.set('json replacer', (key: string, value: unknown) => value ?? undefined);

                app.use(bodyParser.json({ type: ['json', '+json'], limit: 5 * 1024 * 1024 }));
                this.log.info('Start initialize passport...');
                app.use(session({
                    cookie: {
                        path: '/',
                        httpOnly: true,
                        secure: 'auto'
                    },
                    secret: 'secret',
                    name: 'secretName',
                    resave: false,
                    saveUninitialized: false,
                    store: MongoStore.create({ mongoUrl: this.config.config.mongoDb.connectionString })
                }));

                passport.use(new BasicStrategy({ realm: 'Snake API' },
                    (username: string, password: string, done: (err: Error | null, user?: User | boolean) => void) => {
                        this.authenticateUser(username, password, done);
                    }));
                passport.use(new LocalStrategy((username: string, password: string, done: (err?: Error | null, user?: User | boolean) => void) => {
                    this.authenticateUser(username, password, done);
                }));

                app.use(passport.initialize());
                app.use(passport.session());

                passport.serializeUser((user: Express.User, done: (err: Error | null, userId: any) => void) => {
                    done(null, user);
                });

                passport.deserializeUser(async (user: User, done: (err: Error | null, user: User | null) => void) => {
                    const dbUser = await this.userRepository?.findUserByName(user.name);

                    if (!dbUser) {
                        done(new Error('Could not find user'), null);
                        return;
                    }

                    done(null, dbUser);
                });

                app.all('*', (request: Request, response: Response, next: NextFunction) => {
                    passport.authenticate(['basic', 'local', 'session'])(request, response, next);
                });

                app.all('*', (request: Request, response: Response, next: NextFunction) => {
                    if (!request.isAuthenticated()) {
                        this.destroySession(request, () => {
                            const authHeader = request.header('Authorization');
                            if (authHeader && authHeader.toLowerCase() === 'none') {
                                // allow AngularJS code check for valid authentication without Basic Auth dialog popping up
                                response.status(401).end();
                            } else {
                                response.status(401).header({ 'WWW-Authenticate': 'Basic realm="Snake API"' }).end();
                            }
                        });
                    } else {
                        next();
                    }
                });

                this.log.info('Successfully initialize passport authentication');
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

    private destroySession(request: Request, callback?: () => void) {
        if (request.session && typeof request.session.destroy === 'function') {
            request.session.destroy((err: Error) => {
                if (err) {
                    this.log.warn('Could not destroy session', { error: err });
                }
                if (callback) {
                    callback();
                }
            });
        } else {
            if (callback) {
                callback();
            }
        }
    }

    private async authenticateUser(username: string, password: string, done: (err: Error | null, result: boolean | User) => void): Promise<void> {
        this.log.info(username);

        this.userRepository?.findUserByName(username).then((user: User | null) => {
            if (!user) {
               this.log.error(`User ${username} not found.`);
               done(null, false);
               return;
            }

            const sha512 = crypto.createHash('sha512');
            sha512.update(Buffer.from(user.pw_salt, 'base64'));
            sha512.update(Buffer.from(password, 'utf8'));
            const hash = sha512.digest().toString('base64');

            if (hash !== user.pw_hash) {
                this.log.error('Passwords don\'t match', username);
                done(null, false);
                return;
            }

            done(null, user);
        }).catch((err: Error) => {
            this.log.error('Authenticate User ' + username + ' failed', { error: err });
            done(null, false);
        });
    }
}

void new App('Snake Server', new Config()).start();
