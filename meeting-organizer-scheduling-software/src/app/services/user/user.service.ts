import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User, UserCredentials } from 'src/app/models/user';
import { environment } from 'src/environments/environment';
import { of, Observable } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Group } from 'src/app/models/group';
import { tap } from 'rxjs/operators';
import { auth } from 'google-auth-library';
import { Calendar, CalType } from 'src/app/models/calendar';
import { AlertService } from '../alert/alert.service';
import { HashService } from '../hash/hash.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {  

  constructor(private http: HttpClient, private authService: AuthService, private alertService: AlertService, private hash: HashService) { }

  getAll() {
    return this.http.get<User[]>(`${environment.apiUrl}/users`);
  }

  changeUserData(data: UserCredentials): Observable<User> {
    if (data._id !== this.authService.currentUserValue._id  ||
       (data.password && data.password.length < 8) ||
       (data.email    && data.email.length === 0)  ||
       (data.name     && data.name.length === 0))  {

      this.alertService.error('Userdata is wrong')
      return;
    }
    return this.http.patch<User>(`${environment.apiUrl}/users/${this.authService.currentUserValue._id}`, data);
  }

  /**
   * Calls the delete-user part of the backend.
   * On the backend it will check whether the password fits to the user being deleted to prevent
   * injection of another user id.
   * Thus an options constant is needed.
   * @param password entered password to see if the user is actually who he says he is
   */
  deleteUser(password: string) {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: {
        password: password
      }
    }
    return this.http.delete(`${environment.apiUrl}/users/${this.authService.currentUserValue._id}`, options);
  }

  searchUser(term: String): Observable<User[]> {
    if (!term.trim()) {
      return of([]);
    }
    return this.http.get<User[]>(`${environment.apiUrl}/users/search/${term}`);
  }

  register(user: User) {
    return this.http.post(`${environment.apiUrl}/users/register`, user);
  }

  addGroupToUser(groupID: string, user: User) {
    let newGroups: string[] = user.groups;
    newGroups.push(groupID);
    let body: Object = {groups: newGroups};
    return this.http.patch(`${environment.apiUrl}/users/${user._id}`, body);
  }

  deleteGroupFromUser(groupID: string, user: User) {
    let groupIndex = user.groups.indexOf(groupID);
    user.groups.splice(groupIndex, 1);
    let body: Object = {groups: user.groups};
    return this.http.patch(`${environment.apiUrl}/users/${user._id}`, body);
  }

  searchUserGroups(term: string, user: User): Observable<Group[]> {
    if (!term.trim()) {
      return of([]);
    }
    return this.http.get<Group[]>(`${environment.apiUrl}/users/${user._id}/groups/search/${term}`);
  }

  createNewCalendar(code: string, type: CalType) {
    if (!code) {
      return of([]);
    }
    let body = { code: code };
    return this.http.post(`${environment.apiUrl}/users/${this.authService.currentUserValue._id}/calendars/${type}`, body);
  }

  getAllCalendars(): Observable<Calendar[]> {
    return this.http.get<Calendar[]>(`${environment.apiUrl}/users/${this.authService.currentUserValue._id}/calendars`);
  }
}
