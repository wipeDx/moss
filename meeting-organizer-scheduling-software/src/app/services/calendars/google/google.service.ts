import { Injectable, Inject } from '@angular/core';
import { calendar_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../user/user.service';
import { AuthService } from 'src/app/auth/auth.service';
import { Calendar, CalType } from 'src/app/models/calendar';
import { Timeslot, Color } from 'src/app/models/timeslot';

const { google } = require('googleapis');

@Injectable({
  providedIn: 'root',
})
export class GoogleService {
  

  constructor(
    private oAuth2Client: OAuth2Client,
    private calendar: calendar_v3.Calendar,
    private http: HttpClient,
    private userService: UserService,
    private authService: AuthService
    )
  {
  }

  getOAuthURL() {
    return this.oAuth2Client.generateAuthUrl({// 'offline' also gets refresh_token  
      access_type: 'offline',// put any scopes you need there, 
      scope: [    // in the first example we want to read calendar events
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/calendar.readonly',  ],
    });
  }

  getOAuthToken(code: string) {
    return this.userService.createNewCalendar(code, CalType.GOOGLE);
  }
}
