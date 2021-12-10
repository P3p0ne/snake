import { Injectable } from '@angular/core';
import {
  Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import {UserService} from "../services/user.service";
import {User} from "../interfaces/user.interface";
import {PagedResult} from "../interfaces/paged-result.interface";

@Injectable({
  providedIn: 'root'
})
export class HighscoreListResolver implements Resolve<PagedResult<User>> {
  public constructor(private readonly userService: UserService) {
  }

  public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<PagedResult<User>> {
    return this.userService.getTopUser();
  }
}
