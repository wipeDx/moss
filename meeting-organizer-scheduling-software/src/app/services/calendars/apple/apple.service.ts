import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/auth/auth.service';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppleService {

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getAuthUrl(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/users/${this.authService.currentUserValue._id}/calendars/apple/authURL`);
  }
}
