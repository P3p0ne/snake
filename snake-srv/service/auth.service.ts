import {inject, injectable} from "inversify";
import {TYPES} from "../inversify/inversify-types";
import {Logger} from "../util/logger";
import {UserRepository} from "../db/repositories/user.repository";
import {User} from "../entities/user.entity";
import crypto from "crypto";
import {Config} from "../util/config";

@injectable()
export class AuthService {
    public constructor(
        @inject(TYPES.Logger) private readonly log: Logger,
        @inject(TYPES.Config) private readonly config: Config,
        @inject(TYPES.UserRepository) private readonly userRepository: UserRepository
    ) {}

    public async signIn(username: string, password: string): Promise<User> {
        const loggedUser = await this.userRepository.findUserByName(username);

        if(loggedUser == null) {
            const message = `Could not find user with username ${username}.`;
            this.log.info(message);
            throw new Error(message);
        }

        // Password check
        const sha512 = crypto.createHash('sha512');
        sha512.update(Buffer.from(loggedUser.pw_salt, 'base64'));
        sha512.update(Buffer.from(password, 'utf8'));
        const hash = sha512.digest().toString('base64');

        if (hash !== loggedUser.pw_hash) {
            this.log.error('Login failed: Incorrect password');
            throw new Error('Login failed: Incorrect password.');
        }

        this.log.info('Successfully logged in');
        return loggedUser;
    }
}
