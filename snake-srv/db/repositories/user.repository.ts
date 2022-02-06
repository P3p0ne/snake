import {inject, injectable} from "inversify";
import {TYPES} from "../../inversify/inversify-types";
import {Logger} from "../../util/logger";
import {Database} from "../database";
import {User} from "../../entities/user.entity";
import {Collection, MongoError} from "mongodb";
import {PagedResult} from "../../entities/paged-result.entity";

@injectable()
export class UserRepository {
    private readonly collection: Collection<User>;
    private readonly collectionName = 'users';

    public constructor(@inject(TYPES.Logger) private readonly log: Logger, @inject(TYPES.Database) database: Database) {
        this.collection = database.getDb().collection(this.collectionName);
    }

    public async insertUser(user: User): Promise<void> {
        try {
            await this.collection.insertOne(user);
        } catch (e: unknown) {
            this.log.error(`Failed to execute insertOne on collection ${this.collectionName}`, { error: (e as MongoError).stack });
            if ((e as MongoError).code === 11000) {
                throw new MongoError('duplicate key');
            }
            throw e;
        }
    }

    public async updateHighscore(id: string, highscore: number): Promise<void> {
        await this.collection.updateOne({ id }, { $set: { highscore }});
    }

    public async findUserById(id: string): Promise<User | null> {
        return this.collection.findOne({ id }, { projection: { _id: 0 }});
    }

    public async findUserByName(username: string): Promise<User | null> {
        return this.collection.findOne({ username }, { projection: { _id: 0 }});
    }

    public async findTopUsers(limit: number, offset: number): Promise<PagedResult<User>> {
        const cursor = this.collection
            .find({}, { projection:{ _id: 0, pw_hash: 0, pw_salt: 0 }})
            .sort({ highscore: "desc" })
            .limit(limit)
            .skip(offset);

        try {
            const count = await cursor.count({ skip: 0, limit: 0});
            const items = await cursor.toArray();

            return new PagedResult<User>(items, count, limit, offset);
        } catch (err: unknown) {
            this.log.error(`Failed to execute findPaged on collection ${this.collectionName}`, { error: (err as MongoError).stack });
            throw err;
        }
    }
}
