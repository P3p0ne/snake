import {inject, injectable} from "inversify";
import {Logger} from "../util/logger";
import { Db, MongoClient } from 'mongodb';
import {TYPES} from "../inversify/inversify-types";
import {Config} from "../util/config";

@injectable()
export class Database {
    private readonly mongoClient: MongoClient;

    private connected = false;
    private db: Db | undefined;

    public constructor(@inject(TYPES.Config) private readonly config: Config, @inject(TYPES.Logger) private readonly log: Logger) {
        this.mongoClient = new MongoClient(config.config.mongoDb.connectionString, { ignoreUndefined: true });
    }

    public async connect(): Promise<void> {
        try {
            await this.mongoClient.connect();
            this.db = this.mongoClient.db();
            void this.checkConnection();
            this.log.info('Successfully connected to database');
        } catch (e: unknown) {
            this.log.error('Failed to connect to database', { err: e });
            throw e;
        }
    }

    public async disconnect() {
        try {
            await this.mongoClient.close();
            this.connected = false;
            this.db = undefined;
        } catch (e: unknown) {
            this.log.error('Failed to disconnect from database', { err: e });
            throw e;
        }
    }

    public getMongoClient(): MongoClient {
        return this.mongoClient;
    }

    public getDb(): Db {
        if (!this.db) {
            throw new Error('No database connection');
        }

        return this.db;
    }

    private async checkConnection(): Promise<void> {
        if (!this.db) {
            return;
        }

        try {
            await this.db.command({ ping: 1 });
            this.connected = true;
        } catch (e: unknown) {
            this.connected = false;
        } finally {
            setTimeout(() => this.checkConnection(), 10000);
        }
    }
}
