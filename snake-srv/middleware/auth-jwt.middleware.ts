import {inject, injectable} from "inversify";
import {BaseMiddleware} from "inversify-express-utils";
import {Request, Response, NextFunction} from 'express';
import {ForbiddenError, InternalServerError} from "../util/problem-json-errors";
import jwt from 'jsonwebtoken';
import {TYPES} from "../inversify/inversify-types";
import {Config} from "../util/config";

@injectable()
export class AuthJwtMiddleware extends BaseMiddleware {
    public constructor(@inject(TYPES.Config) private readonly config: Config) {
        super();
    }

    public handler(req: Request, res: Response, next: NextFunction): void {
        let token = req.headers['x-access-token'];

        if (!token) {
            throw new ForbiddenError('No token provided!');
        }

        try {
            jwt.verify(token as string, this.config.config.secret);
            next();
        } catch (e) {
            throw new InternalServerError((e as Error).message);
        }
    }

}
