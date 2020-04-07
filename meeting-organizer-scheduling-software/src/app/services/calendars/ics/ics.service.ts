import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/auth/auth.service';
import { environment } from 'src/environments/environment';
import { CalType } from 'src/app/models/calendar';

@Injectable({
  providedIn: 'root'
})
export class IcsService {

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  addICSFeed(feed: string, name: string) {
    let body = {
      name: name,
      accessIdentifier: feed,
      type: CalType.ICS
    }
    return this.http.post(`${environment.apiUrl}/users/${this.authService.currentUserValue._id}/calendars/${CalType.ICS}`, body);
  }
}
