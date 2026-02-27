import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject, map } from 'rxjs';
import {
  IUser,
  IRequestLogin,
  IRequestRegister,
} from '../_models/account.models';
import { environment } from 'src/environments/environment.development';
import { PresenceService } from './presence.service';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private currentUser = new ReplaySubject<IUser | null>(1);
  currentUser$ = this.currentUser.asObservable();
  private baseUrl: string = environment.baseUrl;

  constructor(private http: HttpClient , private presenceService:PresenceService) {}

  login(login: IRequestLogin) {
    console.log("login");
    console.log("this.baseUrl",this.baseUrl);
    
    return this.http.post<IUser>(`${this.baseUrl}/Account/login`, login).pipe(
      map((response: IUser) => {
        console.log("login service");
        if (response.token && response.token) {
          // var userString: string = JSON.stringify(response);
          // localStorage.setItem('User', userString);
          this.setCurrentUser(response);
          this.presenceService.createHubConnection(response);

        }
        return response;

      })
    );
  }
  register(register: IRequestRegister) {
    return this.http
      .post<IUser>(`${this.baseUrl}/Account/register`, register)
      .pipe(
        map((response: IUser) => {
          if (response.token && response.token) {
            // var userString: string = JSON.stringify(response);
            // localStorage.setItem('User', userString);
            this.setCurrentUser(response);
            this.presenceService.createHubConnection(response);

          }
          return response;
        })
      );
  }

  isExistUserName(username:string){
    return this.http.get<boolean>(`${this.baseUrl}/User/is-exist-username/${username}`)
  }

  setCurrentUser(user: IUser | null) {
    if (user) {
      user.roles=[];
      const role=this.decodeToken(user.token)?.role;
      console.log(role);
      
      if(role)
        Array.isArray(role)?user.roles=role : user.roles.push(role);

      var userString: string = JSON.stringify(user);
      localStorage.setItem('User', userString);
      this.currentUser.next(user);
    }
  }
  logout() {
    localStorage.removeItem('User');
    this.currentUser.next(null);
    this.presenceService.stopHubConnection();
  }
  private decodeToken(token:string){
    return JSON.parse(atob(token.split('.')[1]));
  }
}
