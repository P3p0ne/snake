import {
    BaseHttpController,
    controller,
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

@controller('/auth')
export class AuthController extends BaseHttpController {

    public constructor(@inject(TYPES.AuthService) private readonly authService: AuthService) {
        super();
    }

    @httpPost('/signin')
    private async signIn(@request() req: Request, @response() res: Response, @requestBody() body: { username: string, password: string }): Promise<results.JsonResult> {
        if (!body.hasOwnProperty('username') || !body.hasOwnProperty('password')) {
            return this.json({ error: 'Invalid Request. Credentials missing.' }, 400);
        }

        try {
            const loggedUser = await this.authService.signIn(body.username, body.password);

            const {pw_salt, pw_hash, ...apiUser } = loggedUser;
            return this.json(apiUser, 200);
        } catch (e: unknown) {
            return this.json({error: (e as Error).message}, 400);
        }
    }
}
