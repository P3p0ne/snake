import {inject, injectable} from "inversify";
import {TYPES} from "../inversify/inversify-types";
import {GameRepository} from "../db/repositories/game.repository";
import {Game} from "../entities/game.entity";
import {PagedResult} from "../entities/paged-result.entity";
import * as uuid from 'uuid';

@injectable()
export class GameService {
    public constructor(@inject(TYPES.GameRepository) private readonly gameRepository: GameRepository) {}

    public async saveGame(userId: string, score: number): Promise<void> {
        await this.gameRepository.insertGame({
            id: uuid.v4(),
            userId,
            score,
            timestamp: new Date()
        });
    }

    public getGamesByUserId(userId: string, limit?: number, offset?: number): Promise<PagedResult<Game>> {
        if (!limit) {
            limit = 10;
        }
        if (!offset) {
            offset = 0;
        }
        return this.gameRepository.getGamesByUserId(userId, limit, offset)
    }
}
