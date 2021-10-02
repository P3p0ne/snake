import {controller, httpPost, request, requestBody, requestParam, response, TYPE} from "inversify-express-utils";
import {Request, Response} from "express";
import {User} from "../entities/user.entity";
import {inject} from "inversify";
import {TYPES} from "../inversify/inversify-types";
import {UserService} from "../service/user.service";

@controller('/users')
export class UserController {
    public constructor(@inject(TYPES.UserService) private readonly userService: UserService) {}


    @httpPost('/')
    private createUser(@request() req: Request, @response() res: Response, @requestBody() body: User) {
        return this.userService.createUser(body);
    }
}
