import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Game} from "../interfaces/game.interface";
import {Observable} from "rxjs";

const GAME_API = 'http://localhost:8080/games';
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'})
}

@Injectable({
  providedIn: 'root'
})
export class GameService {

  public constructor(private readonly http: HttpClient) { }

  public saveGame(game: Game): Observable<any> {
    return this.http.post(GAME_API, { userId: game.userId, score: game.score }, httpOptions);
  }

  public getGamesByUserId(userId: string): Observable<Array<Game>> {
    return this.http.get<Array<Game>>(`${GAME_API}/${userId}`, httpOptions);
  }
}
