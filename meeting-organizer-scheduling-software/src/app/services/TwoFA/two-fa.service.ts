import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/auth/auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TwoFAService {



  constructor (
    private http: HttpClient,
    private authService: AuthService
    ) {

    }
  
    verifyToken(token: number, enabling: boolean): Observable<any> {
      return this.http.post(`${environment.apiUrl}/users/${this.authService.currentUserValue._id}/2fa`, {token: token, enabling: enabling});
    }
    
    removeToken(token: number): Observable<any> {
      return this.http.delete(`${environment.apiUrl}/users/${this.authService.currentUserValue._id}/2fa/${token}`);
    }

    getSecret(): Observable<any> {
      return this.http.get(`${environment.apiUrl}/users/${this.authService.currentUserValue._id}/2fa`);
    }
}
