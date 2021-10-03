import {controller, httpPost, request, requestBody, requestParam, response, TYPE} from "inversify-express-utils";
import {Request, Response} from "express";
import {User} from "../entities/user.entity";
import {inject} from "inversify";
import {TYPES} from "../inversify/inversify-types";
import {UserService} from "../service/user.service";
import {ResponseError} from "../util/util";

@controller('/users')
export class UserController {
    public constructor(@inject(TYPES.UserService) private readonly userService: UserService) {}

    @httpPost('/')
    private async createUser(@request() req: Request, @response() res: Response, @requestBody() body: { name: string, password: string }) {
        try {
            await this.userService.createUser(body);
            res.status(201).end();
            return;
        } catch (e: unknown) {
            if (e instanceof ResponseError) {
                res.status(e.code).json({error: e.message});
                return;
            }
            res.status(500).json({error: 'Internal Server Error'});
        }
    }
}
