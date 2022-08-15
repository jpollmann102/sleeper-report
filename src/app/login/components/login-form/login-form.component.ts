import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { catchError, of, take } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements OnInit {
  public userId = '';
  public error = '';

  constructor(private authService:AuthService,
              private router:Router) { }

  ngOnInit(): void {
  }

  login() {
    this.error = '';
    
    this.authService.getUser(this.userId)
      .pipe(
        take(1),
        catchError((error) => {
          console.error(error);
          this.error = error;
          return of(null);
        })
      )
      .subscribe((value) => {
        localStorage.setItem(
          this.authService.token, 
          JSON.stringify(value)
        );
        this.authService.setAuthUser(value);
        this.router.navigate(['leagues']);
      });
  }

}
