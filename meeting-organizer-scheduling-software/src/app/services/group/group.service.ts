import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/auth/auth.service';
import { environment } from 'src/environments/environment';
import { Group } from 'src/app/models/group';
import { Observable, of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class GroupService {

  constructor(private http: HttpClient, private authService:AuthService) {
  }

  getGroups() {
    return this.http.get<Group[]>(`${environment.apiUrl}/users/${this.authService.currentUserValue._id}/groups`);
  }

  addGroup(group: Group) {
    return this.http.post(`${environment.apiUrl}/groups`, group);
  }

  deleteGroup(group: Group) {
    return this.http.delete(`${environment.apiUrl}/groups/${group._id}`);
  }

  getGroup(groupID: string) {
    return this.http.get<Group>(`${environment.apiUrl}/groups/${groupID}`);
  }

  updateGroup(group: Group) {
    let body = { name: group.name, members: group.members };
    return this.http.patch(`${environment.apiUrl}/groups/${group._id}`, body);
  }

  searchGroups(term: String): Observable<Group[]> {
    if (!term.trim()) {
      return of([]);
    }
    return this.http.get<Group[]>(`${environment.apiUrl}/groups/search/${term}`);
  }
}
