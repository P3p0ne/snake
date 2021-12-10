import {
    BaseHttpController,
    controller,
    httpGet,
    httpPatch,
    httpPost,
    queryParam,
    request,
    requestBody,
    requestParam,
    response,
    results
} from "inversify-express-utils";
import {Request, Response} from "express";
import {inject} from "inversify";
import {TYPES} from "../inversify/inversify-types";
import {UserService} from "../service/user.service";
import {BadRequestError, ValidationError} from "../util/problem-json-errors";
import {PagedResultQuerySchema} from "../schemas/paged-result-query.schema";

@controller('/users', TYPES.AuthJwtMiddleware)
export class UserController extends BaseHttpController {
    public constructor(@inject(TYPES.UserService) private readonly userService: UserService) {
        super();
    }

    @httpGet('/highscores')
    private async getTopUsers(@request() req: Request, @response() res: Response): Promise<results.JsonResult> {
        const validationResult = PagedResultQuerySchema.validate(req.query);

        if (validationResult.error) {
            throw new ValidationError(validationResult.error.message);
        }

        const result: { limit: number, offset: number } = validationResult.value;

        return this.json(await this.userService.getTopPlayers(result.limit, result.offset), 200);
    }

    @httpPatch('/:id/highscore')
    private async patchUserHighscore(@request() req: Request, @response() res: Response,@requestParam('id') userId: string, @requestBody() body: { highscore: number }): Promise<results.StatusCodeResult> {
        if(!body.hasOwnProperty('highscore')) {
            throw new BadRequestError('Body is incorrect. Highsore is missing.');
        }

        await this.userService.updateUserHighscore(userId, body.highscore);
        return this.statusCode(204);
    }
}
