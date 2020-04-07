import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { AlertService } from '../../alert/alert.service';
import { environment } from 'src/environments/environment';
import { UserService } from '../../user/user.service';
import { Observable } from 'rxjs';
import { CalType } from 'src/app/models/calendar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from 'src/app/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class MicrosoftService {

  constructor(
    private msalService: MsalService,
    private alertService: AlertService,
    private userService: UserService,
    private authService: AuthService,
    private http: HttpClient
  ) { }

  // Prompt the user to sign in and
  // grant consent to the requested permission scopes
  // will return to profile page and continue to log in from there
  async signIn() {

    // Simple hardcoded URI in order to go through a auth-code-flow
    // https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow
    // could (and should) add state to that 
    let uri = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?'
            + `client_id=${environment.M_API_APP_ID}&`
            + 'response_type=code&'
            + `redirect_uri=${environment.M_API_REDIRECT_URI}&`
            + 'response_mode=query&'
            + `scope=${environment.M_API_SCOPES_URI}&`
            + `prompt=login`;
    
    // encode that string into URI format
    let encodedURI = encodeURI(uri);

    // redirect user to said URI
    window.location.href = encodedURI;
  }

  // Silently request an access token
  // Again, this has to be done manually as there won't be a
  // refresh token that we definitely need in order to not let the user relog every time the
  // token times out
  getInitialAccessToken(code: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/users/${this.authService.currentUserValue._id}/calendars/microsoft`, {code: code});
  }

}
