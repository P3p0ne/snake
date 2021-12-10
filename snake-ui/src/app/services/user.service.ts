import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {PagedResult} from "../interfaces/paged-result.interface";
import {User} from "../interfaces/user.interface";
import {TokenStorageService} from "./token-storage.service";

const USER_API = 'http://localhost:8080/users';



@Injectable({
  providedIn: 'root'
})
export class UserService {
  private httpOptions = {}


  public constructor(private readonly http: HttpClient, private readonly tokenStorage: TokenStorageService) {
      this.httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'X-Access-Token': this.tokenStorage.getToken() as string })
      }
  }

  public getTopUser(): Observable<PagedResult<User>> {
    return this.http.get<PagedResult<User>>(`${USER_API}/highscores`, this.httpOptions);
  }

  public setUserHighscore(userId: string, highscore: number): Observable<any> {
    return this.http.patch(`${USER_API}/${userId}/highscore`, { highscore }, this.httpOptions);
  }
}
