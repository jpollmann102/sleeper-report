import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SleeperUser } from '../interfaces/sleeper-user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public readonly token = 'sleeper-report-user';
  public authUser:SleeperUser | null = null;

  constructor(private router:Router,
              private http:HttpClient) { }

  public get isLoggedIn() {
    return this.authUser !== null;
  }

  public setAuthUser(user:SleeperUser | null) {
    this.authUser = user;
  }

  public getUser(userId:string):Observable<SleeperUser> {
    return this.http.get<SleeperUser>(`https://api.sleeper.app/v1/user/${userId}`);
  }

  public logout() {
    localStorage.removeItem(this.token);
    this.setAuthUser(null);
    this.router.navigate(['login']);
  }
}
