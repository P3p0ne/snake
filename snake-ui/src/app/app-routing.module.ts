import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {RegisterComponent} from "./components/register/register.component";
import {LoginComponent} from "./components/login/login.component";
import {HomeComponent} from "./components/home/home.component";
import {AuthGuard} from "./guards/auth.guard";
import {HighscoreListResolver} from "./resolvers/highscore-list.resolver";
import {SnakeComponent} from "./components/snake/snake.component";
import {GamesResolver} from "./resolvers/games.resolver";

const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard], resolve: { topUser: HighscoreListResolver, lastGames: GamesResolver } },
  { path: 'snake', component: SnakeComponent, canActivate:[AuthGuard], resolve: { topUser: HighscoreListResolver } },
  { path: '', redirectTo: 'home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
