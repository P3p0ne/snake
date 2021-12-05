import { Component, OnInit } from '@angular/core';
import {TokenStorageService} from "../../services/token-storage.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  public constructor(public readonly tokenStorage: TokenStorageService, private readonly router: Router) { }

  ngOnInit(): void {
  }

  public logout(): void {
    console.log('Logout');
      this.tokenStorage.signOut();
      this.router.navigateByUrl('/login');
  }
}
