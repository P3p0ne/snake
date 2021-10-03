import {inject, injectable} from "inversify";
import {TYPES} from "../../inversify/inversify-types";
import {Logger} from "../../util/logger";
import {Database} from "../database";
import {User} from "../../entities/user.entity";
import {Collection, MongoError} from "mongodb";

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

    public async findUserByName(name: string): Promise<User | null> {
        return this.collection.findOne({ name }, { projection: { _id: 0 }});
    }
}
