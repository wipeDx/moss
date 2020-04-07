// https://angular.io/guide/router#teach-authguard-to-authenticate
import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, map, tap, delay } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../models/user';
import { environment } from 'src/environments/environment';
import { UserService } from '../services/user/user.service';

@Injectable({
  providedIn: 'root'
})

// Parts from https://jasonwatmore.com/post/2019/06/10/angular-8-user-registration-and-login-example-tutorial
export class AuthService {

  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  constructor (private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(this.retrieveStorageItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  // store the URL so we can redirect after logging in
  redirectUrl: string;

  updateCurrentUser() {
    let test = this.http.post<any>(`${environment.apiUrl}/users/updateLocalUser`, this.currentUserValue).pipe(
      map(user => {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        this.setStorageItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
    test.subscribe();
  }

  activateAccount(email: string, token: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/users/activate`, { email: email, token: token });
  }

  login(email: string, password: string, rememberme: boolean, otpToken: string) {
    if (rememberme) {
      localStorage.setItem('chosenStorage', 'localStorage');
    }
    else {
      localStorage.setItem('chosenStorage', 'sessionStorage');
    }
    return this.http.post<any>(`${environment.apiUrl}/users/authenticate`, { email, password, otpToken }).pipe(
      map(user => {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        this.setStorageItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        return user;
      })
    );
  }

  logout(): void {
    // remove user from local storage and set current user to null
    this.removeStorageItem('currentUser');
    this.currentUserSubject.next(null);
    localStorage.removeItem('chosenStorage');
  }

  retrieveStorageItem(item: string) {
    if (localStorage.getItem('chosenStorage') === 'sessionStorage') {
      return sessionStorage.getItem(item);
    }
    else {
      return localStorage.getItem(item);
    }
  }

  setStorageItem(item: string, value: string) {
    if (localStorage.getItem('chosenStorage') === 'sessionStorage') {
      return sessionStorage.setItem(item, value);
    }
    else {
      return localStorage.setItem(item, value);
    }
  }

  removeStorageItem(item: string) {
    if (localStorage.getItem('chosenStorage') === 'sessionStorage') {
      return sessionStorage.removeItem(item);
    }
    else {
      return localStorage.removeItem(item);
    }
  }
}