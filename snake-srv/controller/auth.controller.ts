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
import {User} from "../entities/user.entity";

@controller('/auth')
export class AuthController extends BaseHttpController {

    public constructor(@inject(TYPES.AuthService) private readonly authService: AuthService) {
        super();
    }

    @httpPost('/signin')
    private async sigin(@request() req: Request, @response() res: Response, @requestBody() body: User): Promise<results.JsonResult> {
        const user = req.body;
        try {
            const loggedUser = await this.authService.signin(user);
            return this.json(loggedUser, 200);
        } catch (e: unknown) {
            return this.json({error: (e as Error).message}, 400);
        }
    }
}
