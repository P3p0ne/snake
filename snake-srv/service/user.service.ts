import {inject, injectable} from "inversify";
import {TYPES} from "../inversify/inversify-types";
import {Logger} from "../util/logger";
import {User} from "../entities/user.entity";

@injectable()
export class UserService {
    public constructor(@inject(TYPES.Logger) private readonly log: Logger) {}

    public async createUser(user: User): Promise<void> {
        return Promise.resolve();
    }
}
