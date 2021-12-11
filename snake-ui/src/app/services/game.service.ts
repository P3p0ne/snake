import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Game} from "../interfaces/game.interface";
import {Observable} from "rxjs";
import {TokenStorageService} from "./token-storage.service";
import {PagedResult} from "../interfaces/paged-result.interface";

const GAME_API = 'http://localhost:8080/games';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private httpOptions = {};

  public constructor(private readonly http: HttpClient, private readonly tokenStorage: TokenStorageService) {
    this.httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'X-Access-Token': this.tokenStorage.getToken() as string })
    }
  }

  public saveGame(game: Game): Observable<any> {
    return this.http.post(GAME_API, { userId: game.userId, score: game.score }, this.httpOptions);
  }

  public getGamesByUserId(userId: string): Observable<PagedResult<Game>> {
    return this.http.get<PagedResult<Game>>(`${GAME_API}/${userId}`, this.httpOptions);
  }
}
