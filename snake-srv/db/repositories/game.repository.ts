import {inject, injectable} from "inversify";
import {TYPES} from "../../inversify/inversify-types";
import {Logger} from "../../util/logger";
import {Database} from "../database";
import {Collection, MongoError} from "mongodb";
import {Game} from "../../entities/game.entity";
import {PagedResult} from "../../entities/paged-result.entity";

@injectable()
export class GameRepository {
    private readonly collection: Collection<Game>;
    private readonly collectionName = 'games';

    public constructor(@inject(TYPES.Logger) private readonly log: Logger, @inject(TYPES.Database) database: Database) {
        this.collection = database.getDb().collection(this.collectionName);
    }

    public async insertGame(game: Game): Promise<void> {
        try {
            await this.collection.insertOne(game);
        } catch (e: unknown) {
            this.log.error(`Failed to execute insertOne on collection ${this.collectionName}`, { error: (e as MongoError).stack });
            if ((e as MongoError).code === 11000) {
                throw new MongoError('duplicate key');
            }
            throw e;
        }
    }

    public async getGamesByUserId(userId: string, limit: number, offset: number): Promise<PagedResult<Game>> {
        const cursor = this.collection
            .find({ userId })
            .sort({ timestamp: "desc" })
            .limit(limit)
            .skip(offset);

        try {
            const count = await cursor.count({ skip: 0, limit: 0});
            const items = await cursor.toArray();

            return new PagedResult<Game>(items, count, limit, offset);
        } catch (err: unknown) {
            this.log.error(`Failed to execute findPaged on collection ${this.collectionName}`, { error: (err as MongoError).stack });
            throw err;
        }
    }

}
