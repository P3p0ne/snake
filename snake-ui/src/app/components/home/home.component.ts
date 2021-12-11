import { Component, OnInit } from '@angular/core';
import {PagedResult} from "../../interfaces/paged-result.interface";
import {User} from "../../interfaces/user.interface";
import {ActivatedRoute, Router} from "@angular/router";
import {Game} from "../../interfaces/game.interface";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public highscoreUserList: PagedResult<User>;
  public userGames: PagedResult<Game>;

  public displayedColumns = ['name', 'highscore'];

  public constructor(private route: ActivatedRoute, private readonly router: Router) {
      this.highscoreUserList = route.snapshot.data['topUser'];
      this.userGames = route.snapshot.data['lastGames'];
  }

  ngOnInit(): void {}

  public newGame(): void {
    this.router.navigateByUrl('snake');
  }
}
