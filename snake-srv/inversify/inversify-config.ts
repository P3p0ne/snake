import { Container, interfaces } from "inversify";
import { InversifyExpressServer } from "inversify-express-utils";
import { TYPES } from "./inversify-types";
import {Logger} from "../util/logger";
import {LogProvider} from "../util/logProvider";

import '../controller/user.controller';
import '../controller/auth.controller';
import '../controller/highscore.controller';

import {UserService} from "../service/user.service";
import {Database} from "../db/database";
import {Config} from "../util/config";
import {UserRepository} from "../db/repositories/user.repository";
import {AuthService} from "../service/auth.service";

const container = new Container({ skipBaseClassChecks: true });

container.bind<Config>(TYPES.Config).to(Config).inSingletonScope();
container.bind<LogProvider>(TYPES.LogProvider).to(LogProvider).inSingletonScope();
container.bind<Logger>(TYPES.Logger).toDynamicValue(context => {
    const namedMetadata = context.currentRequest.target.getNamedTag();
    const parentRequestBindings = context.currentRequest.parentRequest?.bindings as Array<interfaces.Binding<unknown> & { implementationType: interfaces.Newable<unknown> }>;
    const name = namedMetadata
        ? namedMetadata.value as string
        : Array.isArray(parentRequestBindings) && parentRequestBindings.length > 0
            ? parentRequestBindings[0].implementationType.name
            : 'app';

    return context.container.get<LogProvider>(TYPES.LogProvider).createLogger(name.split(/(?=[A-Z])/).join('-').toLowerCase());
});
container.bind<Database>(TYPES.Database).to(Database).inSingletonScope();
container.bind<UserRepository>(TYPES.UserRepository).to(UserRepository).inSingletonScope();

container.bind<UserService>(TYPES.UserService).to(UserService).inSingletonScope();
container.bind<AuthService>(TYPES.AuthService).to(AuthService).inSingletonScope();

container
    .bind<interfaces.Factory<InversifyExpressServer>>(TYPES.InversifyExpressServerFactory)
    .toFactory<InversifyExpressServer>((context: interfaces.Context) => (): InversifyExpressServer => new InversifyExpressServer(context.container));

export { container };
