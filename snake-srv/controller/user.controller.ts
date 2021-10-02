import {controller, httpPost, request, requestBody, requestParam, response} from "inversify-express-utils";
import {Request, Response} from "express";
import {User} from "../entities/user.entity";

@controller('/users')
export class UserController {
    @httpPost('/')
    private addUser(@request() req: Request, @response() res: Response, @requestBody() body: User) {
        return 'Hello World';
    }
}
