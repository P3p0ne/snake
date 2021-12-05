import {
    BaseHttpController,
    controller, httpGet,
    httpPost, queryParam,
    request,
    requestBody, requestParam,
    response,
    results
} from "inversify-express-utils";
import {inject} from "inversify";
import {TYPES} from "../inversify/inversify-types";
import {GameService} from "../service/game.service";
import {Request, Response} from "express";
import {GameSchema} from "../schemas/game.schema";
import {ValidationError} from "../util/problem-json-errors";
import {PagedResultQuerySchema} from "../schemas/paged-result-query.schema";

@controller('/games', TYPES.AuthJwtMiddleware)
export class GameController extends BaseHttpController {
    public constructor(@inject(TYPES.GameService) private readonly gameService: GameService) {
        super();
    }

    @httpPost('/')
    private async saveGame(@request() req: Request, @response() res: Response, @requestBody() body: { userId: string, score: number }): Promise<results.StatusCodeResult> {
        const validationResult = GameSchema.validate(body);

        if (validationResult.error) {
            throw new ValidationError(validationResult.error.message);
        }

        await this.gameService.saveGame(body.userId, body.score);
        return this.statusCode(201);
    }

    @httpGet('/:userId')
    private async getGamesByUserId(
        @request() req: Request,
        @response() res: Response,
        @requestParam('userId') userId: string): Promise<results.JsonResult> {
        const validationResult = PagedResultQuerySchema.validate(req.query);

        if (validationResult.error) {
            throw new ValidationError(validationResult.error.message);
        }

        const result: { limit: number, offset: number } = validationResult.value;
        return this.json(await this.gameService.getGamesByUserId(userId, result.limit, result.offset));
    }
}
