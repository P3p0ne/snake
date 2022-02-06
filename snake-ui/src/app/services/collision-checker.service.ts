export const enum COLLISIONS {
    NONE,
    BOARD,
    SELF,
    FRUIT
}

export class CollisionChecker {

  public constructor() { }

  public static checkCollision(part: { x: number, y: number }, board: Array<Array<boolean>>, boardSize: number, fruit: { x: number, y: number }): COLLISIONS {
    let collision = CollisionChecker.boardCollision(part, boardSize);
    if (collision !== COLLISIONS.NONE) {
      return collision;
    }

    collision = CollisionChecker.selfCollision(part, board);
    if (collision !== COLLISIONS.NONE) {
      return collision;
    }

    return CollisionChecker.fruitCollision(part, fruit);
  }

  private static boardCollision(part: { x: number, y: number }, boardSize: number): COLLISIONS {
    if (part.x === boardSize || part.x === -1 || part.y === boardSize || part.y === -1) {
      return COLLISIONS.BOARD;
    }
    return COLLISIONS.NONE;
  }

  private static selfCollision(part: { x: number, y: number }, board: Array<Array<boolean>>): COLLISIONS {
    if (board[part.y][part.x]) {
      return COLLISIONS.SELF;
    }
    return COLLISIONS.NONE;
  }

  private static fruitCollision(part: { x: number, y: number }, fruit: { x: number, y: number }): COLLISIONS {
    if (part.x === fruit.x && part.y === fruit.y) {
      return COLLISIONS.FRUIT;
    }
    return COLLISIONS.NONE;
  }
}
