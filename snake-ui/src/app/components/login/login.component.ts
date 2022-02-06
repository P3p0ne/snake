import { Component, OnInit } from '@angular/core';
import {FormControl, Validators} from "@angular/forms";
import {AuthService} from "../../services/auth.service";
import {User} from "../../interfaces/user.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {ToastrService} from "ngx-toastr";
import {TokenStorageService} from "../../services/token-storage.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  hide = true;

  username = new FormControl('', [
    Validators.required,
    Validators.minLength(4),
    Validators.maxLength(15)
  ]);

  password = new FormControl('',[
    Validators.required,
    Validators.minLength(8)
  ]);

  public constructor(
    private readonly authService: AuthService,
    private readonly toastr: ToastrService,
    private readonly tokenStorage: TokenStorageService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    if (this.tokenStorage.getToken()) {
      this.router.navigateByUrl('/home');
    }
  }

  public login(): void {
    if (this.username.valid && this.password.valid) {
      this.authService.login(this.username.value, this.password.value).subscribe({
        next: (user: User) => {
          this.tokenStorage.saveToken(user.access_token);
          this.tokenStorage.saveUser(user);

          this.router.navigateByUrl('/');
        },
        error: (err: HttpErrorResponse) => {
          this.toastr.error(`Status: ${err.status} - ${err.statusText}`);
        }
      });
    }
  }

}
