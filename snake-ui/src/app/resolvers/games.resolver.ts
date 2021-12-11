import { Injectable } from '@angular/core';
import {
  Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import {PagedResult} from "../interfaces/paged-result.interface";
import {Game} from "../interfaces/game.interface";
import {GameService} from "../services/game.service";
import {TokenStorageService} from "../services/token-storage.service";

@Injectable({
  providedIn: 'root'
})
export class GamesResolver implements Resolve<PagedResult<Game>> {

  public constructor(private readonly gameService: GameService, private tokenService: TokenStorageService) {
  }

  public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<PagedResult<Game>> {
    return this.gameService.getGamesByUserId(this.tokenService.user$.value?.id as  string);
  }
}
