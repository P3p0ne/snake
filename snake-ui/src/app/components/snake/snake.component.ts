import {Component, HostListener, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {TokenStorageService} from "../../services/token-storage.service";
import {User} from "../../interfaces/user.interface";
import {UserService} from "../../services/user.service";

const BOARD_SIZE = 20;

const COLORS = {
  GAME_OVER: '#D24D57',
  FRUIT: '#EC644B',
  HEAD: '#336E7B',
  BODY: '#C8F7C5',
  BOARD: '#332e2e',
  OBSTACLE: '#383522'
};

const CONTROLS = {
  LEFT: 'ArrowLeft',
  UP: 'ArrowUp',
  RIGHT: 'ArrowRight',
  DOWN: 'ArrowDown'
};

const GAME_MODES = {
  classic: 'Classic',
  no_walls: 'No Walls',
  obstacles: 'Obstacles'
};


@Component({
  selector: 'app-snake',
  templateUrl: './snake.component.html',
  styleUrls: ['./snake.component.scss']
})
export class SnakeComponent implements OnInit {
  public gameRunning = false;
  public score = 0;
  public newBestScore = false;
  public board: Array<Array<boolean>> = [];
  public obstacles: Array<{x: number, y: number}> = [];
  public getKeys = Object.keys;

  private snake:{ direction: string | undefined, parts: Array<{ x: number, y: number }> } = {
    direction: CONTROLS.RIGHT,
    parts: [{ x: -1, y: -1 }]
  };

  private fruit = { x: -1, y: -1 };
  private tempDirection: string | undefined;
  private default_mode = 'classic';
  private isGameOver = false;
  private interval: number | undefined;

  @HostListener('window:keydown', ['$event']) handleKeyboardEvents(e: KeyboardEvent) {
    if (e.key === CONTROLS.LEFT && this.snake.direction !== CONTROLS.RIGHT) {
      this.tempDirection = CONTROLS.LEFT;
    } else if (e.key === CONTROLS.UP && this.snake.direction !== CONTROLS.DOWN) {
      this.tempDirection = CONTROLS.UP;
    } else if (e.key === CONTROLS.RIGHT && this.snake.direction !== CONTROLS.LEFT) {
      this.tempDirection = CONTROLS.RIGHT;
    } else if (e.key === CONTROLS.DOWN && this.snake.direction !== CONTROLS.UP) {
      this.tempDirection = CONTROLS.DOWN;
    }

    this.keypress = e.key;
  }

  keypress: string | undefined;

  public constructor(private readonly router: Router, public readonly tokenStorage: TokenStorageService, private readonly userService: UserService) {
    this.setBoard();
  }

  ngOnInit(): void {
    this.gameRunning = false;
  }

  public start(mode: string): void {
    this.default_mode = mode || 'classic';
    this.newBestScore = false;
    this.gameRunning = true;
    this.score = 0;
    this.tempDirection = CONTROLS.RIGHT;
    this.isGameOver = false;
    this.interval = 150;
    this.snake = {
      direction: CONTROLS.RIGHT,
      parts: []
    };

    for (let i = 0; i < 3; i++) {
      this.snake.parts.push({ x: 8 + i, y: 8 });
    }

    if (mode === 'obstacles') {
      this.obstacles = [];
      let j = 1;
      do {
        this.addObstacles();
      } while (j++ < 9);
    }

    this.resetFruit();
    this.updatePositions();
    window.focus();
  }

  public back(): void {
      this.router.navigateByUrl('home');
  }

  public setColors(col: number, row: number): string {
    if (this.isGameOver) {
      return COLORS.GAME_OVER;
    } else if (this.fruit.x === row && this.fruit.y === col) {
      return COLORS.FRUIT;
    } else if (this.snake.parts[0].x === row && this.snake.parts[0].y === col) {
      return COLORS.HEAD;
    } else if (this.board[col][row]) {
      return COLORS.BODY;
    }

    return COLORS.BOARD;
  };

  public addObstacles(): void {
    let x = this.randomNumber();
    let y = this.randomNumber();

    if (this.board[y][x] === true || y === 8) {
      return this.addObstacles();
    }

    this.obstacles.push({
      x: x,
      y: y
    });
  }

  public updatePositions(): void {
    let newHead = this.repositionHead();
    let me = this;

    if (this.default_mode === 'classic' && this.boardCollision(newHead)) {
      return this.gameOver();
    } else if (this.default_mode === 'no_walls') {
      this.noWallsTransition(newHead);
    } else if (this.default_mode === 'obstacles') {
      this.noWallsTransition(newHead);
      if (this.obstacleCollision(newHead)) {
        return this.gameOver();
      }
    }

    if (this.selfCollision(newHead)) {
      return this.gameOver();
    } else if (this.fruitCollision(newHead)) {
      this.eatFruit();
    }

    let oldTail = this.snake.parts.pop();
    this.board[oldTail!.y][oldTail!.x] = false;

    this.snake.parts.unshift(newHead);
    this.board[newHead.y][newHead.x] = true;

    this.snake.direction = this.tempDirection as string;

    setTimeout(() => {
      me.updatePositions();
    }, this.interval);
  }

  public repositionHead(): any {
    let newHead = {...this.snake.parts[0]};

    if (this.tempDirection === CONTROLS.LEFT) {
      newHead.x -= 1;
    } else if (this.tempDirection === CONTROLS.RIGHT) {
      newHead.x += 1;
    } else if (this.tempDirection === CONTROLS.UP) {
      newHead.y -= 1;
    } else if (this.tempDirection === CONTROLS.DOWN) {
      newHead.y += 1;
    }

    return newHead;
  }

  public noWallsTransition(part: { x: number, y: number }): void {
    if (part.x === BOARD_SIZE) {
      part.x = 0;
    } else if (part.x === -1) {
      part.x = BOARD_SIZE - 1;
    }

    if (part.y === BOARD_SIZE) {
      part.y = 0;
    } else if (part.y === -1) {
      part.y = BOARD_SIZE - 1;
    }
  }

  public checkObstacles(x: number, y: number): boolean {
    let res = false;

    this.obstacles.forEach((val) => {
      if (val.x === x && val.y === y) {
        res = true;
      }
    });

    return res;
  }

  public obstacleCollision(part: { x: number, y: number }): boolean {
    return this.checkObstacles(part.x, part.y);
  }

  public boardCollision(part: { x: number, y: number }): boolean {
    return part.x === BOARD_SIZE || part.x === -1 || part.y === BOARD_SIZE || part.y === -1;
  }

  public selfCollision(part: { x: number, y: number }): boolean {
    return this.board[part.y][part.x];
  }

  public fruitCollision(part: { x: number, y: number }): boolean {
    return part.x === this.fruit.x && part.y === this.fruit.y;
  }

  public gameOver(): void {
    this.isGameOver = true;
    this.gameRunning = false;
    let me = this;

    if (this.tokenStorage.user$.value && this.score > this.tokenStorage.user$.value.highscore) {
      this.tokenStorage.user$.value.highscore = this.score;
      this.userService.setUserHighscore(this.tokenStorage.user$.value.id, this.score).subscribe({
        next: () => {
        },
        error: error => {}
      })
      this.newBestScore = true;
    }

    setTimeout(() => {
      me.isGameOver = false;
    }, 500);

    this.setBoard();
  }

  public randomNumber(): any {
    return Math.floor(Math.random() * BOARD_SIZE);
  }

  public resetFruit(): void {
    let x = this.randomNumber();
    let y = this.randomNumber();

    if (this.board[y][x] === true || this.checkObstacles(x, y)) {
      return this.resetFruit();
    }

    this.fruit = {
      x: x,
      y: y
    };
  }

  public eatFruit(): void {
    this.score++;

    let tail = Object.assign({}, this.snake.parts[this.snake.parts.length - 1]);

    this.snake.parts.push(tail);
    this.resetFruit();

    if (this.score % 5 === 0) {
      this.interval! -= 15;
    }
  }

  private setBoard(): void {
    this.board = [];

    for (let i = 0; i < BOARD_SIZE; i++) {
      this.board[i] = [];
      for (let j = 0; j < BOARD_SIZE; j++) {
        this.board[i][j] = false;
      }
    }
  }
}
