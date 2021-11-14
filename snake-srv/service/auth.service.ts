import {inject, injectable} from "inversify";
import {TYPES} from "../inversify/inversify-types";
import {Logger} from "../util/logger";
import {UserRepository} from "../db/repositories/user.repository";
import {User} from "../entities/user.entity";

@injectable()
export class AuthService {
    public constructor(
        @inject(TYPES.Logger) private readonly log: Logger,
        @inject(TYPES.UserRepository) private readonly userRepository: UserRepository
    ) {}

    public async signin(user: User): Promise<User> {
        const loggedUser = await this.userRepository.findUserByName(user.name);

        if(loggedUser == null) {
            const message = `Could not find user with username ${user.name}.`;
            this.log.info(message);
            throw new Error(message);
        }



        return loggedUser;
    }
}
