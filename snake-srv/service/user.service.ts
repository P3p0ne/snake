import {inject, injectable} from "inversify";
import {TYPES} from "../inversify/inversify-types";
import {Logger} from "../util/logger";
import {User} from "../entities/user.entity";
import {UserRepository} from "../db/repositories/user.repository";
import * as crypto from 'crypto';
import * as uuid from 'uuid';
import {ResponseError} from "../util/util";

@injectable()
export class UserService {
    public constructor(@inject(TYPES.Logger) private readonly log: Logger, @inject(TYPES.UserRepository) private readonly userRepository: UserRepository) {}

    public async createUser(user: { name: string, password: string }): Promise<void> {
        // Check username already exists
        const dbUser = await this.userRepository.findUserByName(user.name);
        if (dbUser != null) {
            this.log.error(`Username "${user.name}" already exists.`);
            throw new ResponseError('Username already exists.', 400);
        }

        // Hash password to save in db
        const sha512 = crypto.createHash('sha512');
        const salt = crypto.randomBytes(64);
        sha512.update(salt);
        sha512.update(Buffer.from(user.password, 'utf-8'));
        const hash = sha512.digest();

        // create new user
        const newUser: User = {
            id: uuid.v4(),
            name: user.name,
            pw_hash: hash.toString('base64'),
            pw_salt: salt.toString('base64'),
            highscore: 0
        }

        // save new user in db
        return this.userRepository.insertUser(newUser);
    }

    public async getTopPlayer(limit?: number, offset?: number): Promise<Array<User>> {
        if (!limit) {
            limit = 10;
        }
        if (!offset) {
            offset = 0;
        }

        return this.userRepository.findTopUsers(limit, offset);
    }
}
