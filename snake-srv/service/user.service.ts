import {inject, injectable} from "inversify";
import {TYPES} from "../inversify/inversify-types";
import {Logger} from "../util/logger";
import {User} from "../entities/user.entity";
import {UserRepository} from "../db/repositories/user.repository";
import bcrypt from 'bcryptjs';
import * as uuid from 'uuid';
import {PagedResult} from "../entities/paged-result.entity";
import {BadRequestError, UserExistsError, UserNotExistsError} from "../util/problem-json-errors";

@injectable()
export class UserService {
    public constructor(@inject(TYPES.Logger) private readonly log: Logger, @inject(TYPES.UserRepository) private readonly userRepository: UserRepository) {}

    public async createUser(user: { username: string, password: string }): Promise<void> {
        // Check username already exists
        const dbUser = await this.userRepository.findUserByName(user.username);
        if (dbUser != null) {
            this.log.error(`Username "${user.username}" already exists.`);
            throw new UserExistsError('Username already exists.');
        }

        // create new user
        const newUser: User = {
            id: uuid.v4(),
            username: user.username,
            pw_hash: bcrypt.hashSync(user.password, 8),
            highscore: 0
        }

        // save new user in db
        return this.userRepository.insertUser(newUser);
    }

    public async getTopPlayers(limit?: number, offset?: number): Promise<PagedResult<User>> {
        if (!limit) {
            limit = 10;
        }
        if (!offset) {
            offset = 0;
        }

        return this.userRepository.findTopUsers(limit, offset);
    }

    public async updateUserHighscore(id: string, highscore: number): Promise<void> {
        const user = await this.userRepository.findUserById(id);

        if (!user) {
            throw new UserNotExistsError('Could not find user to update highscore');
        }

        if (user.highscore >= highscore) {
            throw new BadRequestError('Current Game score is lower or equal than current user highscore');
        }

        await this.userRepository.updateHighscore(id, highscore);
    }
}
