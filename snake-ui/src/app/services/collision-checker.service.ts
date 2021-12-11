export const enum COLLISTIONS {
    NONE,
    BOARD,
    SELF,
    FRUIT
}

export class CollisionChecker {

  public constructor() { }

  public static checkCollision(part: { x: number, y: number }, board: Array<Array<boolean>>, boardSize: number, fruit: { x: number, y: number }): COLLISTIONS {
    let collision = CollisionChecker.boardCollision(part, boardSize);
    if (collision !== COLLISTIONS.NONE) {
      return collision;
    }

    collision = CollisionChecker.selfCollision(part, board);
    if (collision !== COLLISTIONS.NONE) {
      return collision;
    }

    return CollisionChecker.fruitCollision(part, fruit);
  }

  private static boardCollision(part: { x: number, y: number }, boardSize: number): COLLISTIONS {
    if (part.x === boardSize || part.x === -1 || part.y === boardSize || part.y === -1) {
      return COLLISTIONS.BOARD;
    }
    return COLLISTIONS.NONE;
  }

  private static selfCollision(part: { x: number, y: number }, board: Array<Array<boolean>>): COLLISTIONS {
    if (board[part.y][part.x]) {
      return COLLISTIONS.SELF;
    }
    return COLLISTIONS.NONE;
  }

  private static fruitCollision(part: { x: number, y: number }, fruit: { x: number, y: number }): COLLISTIONS {
    if (part.x === fruit.x && part.y === fruit.y) {
      return COLLISTIONS.FRUIT;
    }
    return COLLISTIONS.NONE;
  }
}
