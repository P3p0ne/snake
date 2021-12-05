import {
    BaseHttpController,
    controller, httpDelete,
    httpPost,
    request,
    requestBody,
    response,
    results
} from "inversify-express-utils";
import {Request, Response} from "express";
import {inject} from "inversify";
import {TYPES} from "../inversify/inversify-types";
import {AuthService} from "../service/auth.service";
import {Logger} from "../util/logger";
import {AuthorizationError, ValidationError} from "../util/problem-json-errors";
import {UserService} from "../service/user.service";

@controller('/auth')
export class AuthController extends BaseHttpController {

    public constructor(
        @inject(TYPES.AuthService) private readonly authService: AuthService,
        @inject(TYPES.Logger) private readonly log: Logger,
        @inject(TYPES.UserService) private readonly userService: UserService) {
        super();
    }

    @httpPost('/signin')
    private async signIn(@request() req: Request, @response() res: Response, @requestBody() body: { username: string, password: string }): Promise<results.JsonResult> {
        if (!body.hasOwnProperty('username') || !body.hasOwnProperty('password')) {
            throw new ValidationError('Wrong Credentials');
        }

        try {
            const loggedUser = await this.authService.signIn(body.username, body.password);

            const {pw_hash, ...apiUser } = loggedUser;
            return this.json(apiUser, 200);
        } catch (e: unknown) {
            throw new AuthorizationError((e as Error).message);
        }
    }

    @httpPost('/signup')
    private async createUser(@request() req: Request, @response() res: Response, @requestBody() body: { username: string, password: string }): Promise<results.JsonResult> {
        if (!body.hasOwnProperty('username') || !body.hasOwnProperty('password')) {
            throw new ValidationError('To register a new user please set username and password');
        }


        await this.userService.createUser(body);
        return this.json(null, 201);
    }
}
