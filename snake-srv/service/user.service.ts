import {inject, injectable} from "inversify";
import {TYPES} from "../inversify/inversify-types";
import {Logger} from "../util/logger";
import {User} from "../entities/user.entity";
import {UserRepository} from "../db/repositories/user.repository";

@injectable()
export class UserService {
    public constructor(@inject(TYPES.Logger) private readonly log: Logger, @inject(TYPES.UserRepository) private readonly userRepository: UserRepository) {}

    public async createUser(user: User): Promise<void> {
        return this.userRepository.insertUser(user);
    }
}
