import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {User} from "../interfaces/user.interface";

const AUTH_API = 'http://localhost:8080/auth';
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'})
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public constructor(private readonly http: HttpClient) { }

  public login(username: string, password: string): Observable<User> {
      return this.http.post<User>(`${AUTH_API}/signin`, { username, password }, httpOptions);
  }

  public register(username: string, password: string): Observable<User> {
    return this.http.post<User>(`${AUTH_API}/signup`,{ username, password }, httpOptions);
  }
}
