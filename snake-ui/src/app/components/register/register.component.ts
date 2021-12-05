import { Component, OnInit } from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {User} from "../../interfaces/user.interface";
import {FormControl, Validators} from "@angular/forms";
import {ToastrService} from "ngx-toastr";
import {HttpErrorResponse} from "@angular/common/http";
import {Router} from "@angular/router";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
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

  public constructor(private readonly authService: AuthService, private readonly toastr: ToastrService, private readonly router: Router) { }

  ngOnInit(): void {
  }

  public getUsernameErrorMessage(): string {
    if (this.username.hasError('required')) {
      return 'You have to enter an username';
    }
    if (this.username.hasError('minlength') || this.username.hasError('maxlength')) {
      return 'Username only allowed characters between 4 and 15';
    }

    return '';
  }

  public getPasswordErrorMessage(): string {
    if (this.password.hasError('required')) {
      return 'You have to enter a password';
    }
    if (this.password.hasError('minlength')) {
      return 'Password must have more than 7 characters';
    }

    return '';
  }

  public onSubmit(): void {
    if (this.username.value && this.password.value) {
      this.authService.register(this.username.value, this.password.value).subscribe({
        next: (user: User) => {
          this.toastr.success('Successfully registered new User');
          this.router.navigateByUrl('/login');
        },
        error: (err: HttpErrorResponse) => {
          this.toastr.error(`Status: ${err.status} - ${err.statusText}`);
        }
      });
    }
  }

}
