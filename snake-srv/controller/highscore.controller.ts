import {BaseHttpController, controller, httpGet, queryParam, request, response, results} from "inversify-express-utils";
import {inject} from "inversify";
import {Request, Response} from "express";
import {TYPES} from "../inversify/inversify-types";
import {UserService} from "../service/user.service";

@controller('/highscores')
export class HighscoreController extends BaseHttpController {
    public constructor(@inject(TYPES.UserService) private readonly userService: UserService) {
        super();
    }

    @httpGet('/')
    private async getTopTenUsers(@request() req: Request, @response() res: Response, @queryParam('limit') limit: string, @queryParam('offset') offset: string): Promise<results.JsonResult> {
        return this.json(await this.userService.getTopPlayer(+limit, +offset), 200);
    }
}
