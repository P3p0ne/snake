import {inject, injectable} from "inversify";
import {TYPES} from "../inversify/inversify-types";
import {Logger} from "../util/logger";
import {UserRepository} from "../db/repositories/user.repository";
import {User} from "../entities/user.entity";
import bcrypt from 'bcryptjs';
import {Config} from "../util/config";
import {AuthorizationError} from "../util/problem-json-errors";
import jwt from 'jsonwebtoken';

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
        const passwordIsValid = bcrypt.compareSync(password, loggedUser.pw_hash);
        if (!passwordIsValid) {
            throw new AuthorizationError('Invalid credentials');
        }

        // Generate new jwt token
        loggedUser.access_token = jwt.sign({ id: loggedUser.id }, this.config.config.secret,{ expiresIn: 86400 });

        this.log.info('Successfully logged in');
        return loggedUser;
    }
}
