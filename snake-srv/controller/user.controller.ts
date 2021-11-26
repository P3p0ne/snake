import {
    BaseHttpController,
    controller,
    httpGet,
    httpPost,
    request,
    requestBody,
    requestParam,
    response, results,
    TYPE
} from "inversify-express-utils";
import {Request, Response} from "express";
import {inject} from "inversify";
import {TYPES} from "../inversify/inversify-types";
import {UserService} from "../service/user.service";
import {ResponseError} from "../util/util";
import passport from "passport";
@controller('/users')
export class UserController extends BaseHttpController {
    public constructor(@inject(TYPES.UserService) private readonly userService: UserService) {
        super();
    }

    @httpPost('/')
    private async createUser(@request() req: Request, @response() res: Response, @requestBody() body: { name: string, password: string }): Promise<results.JsonResult> {
        try {
            await this.userService.createUser(body);
            return this.json(null, 201);
        } catch (e: unknown) {
            if (e instanceof ResponseError) {
                return this.json({error: e.message}, e.code);
            }
            return this.json({error: 'Internal Server Error'}, 500);
        }
    }

    @httpGet('/:id', passport.authenticate(['local', 'basic', 'session']))
    private getUser(@request() req: Request, @response() res: Response, @requestParam('id') id: string): results.JsonResult {
        return this.json({ error: 'HALLO '}, 500);
    }
}
