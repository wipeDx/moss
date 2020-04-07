import { Injectable } from '@angular/core';
import { Calendar, CalType } from 'src/app/models/calendar';
import { GoogleService } from './google/google.service';
import { AppleService } from './apple/apple.service';
import { MicrosoftService } from './microsoft/microsoft.service';
import { IcsService } from './ics/ics.service';
import { AuthService } from 'src/app/auth/auth.service';
import { Timeslot } from 'src/app/models/timeslot';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  constructor(
    private googleService: GoogleService,
    private appleService: AppleService,
    private microsoftService: MicrosoftService,
    private icsService: IcsService,
    private authService: AuthService,
    private http: HttpClient
  ) { }

  // Goes through each of the invitee's calendars
  // and creates a request from the respective sources
  // That promise request gets forwarded so that the 
  // calling function can handle the content
  // async getForeignEvents(calendars: Calendar[], minTime: Date) {
  //   let events = [];
  //   calendars.forEach(async calendar => {
  //     events.concat(await this.switchCaseCalendar(calendar, minTime));
  //   });
  //   return events;
  // }

  // Goes through each of the logged in user's calendars
  // and creates a request from the respective sources
  // That promise request gets forwarded so that the 
  // calling function can handle the content
  // getOwnEvents(minTime: Date) {
  //   let eventPromises = [];
  //   this.authService.currentUserValue.calendars.forEach(calendar => {
  //     eventPromises.push(this.switchCaseCalendar(calendar, minTime));
  //   });
  //   let events: Timeslot[] = [];
   
  //   return Promise.all(eventPromises);
  // }

  // Simply calls the parseEvents in the google service because I couldn't forward this function
  // without compromising readability
  // parseGoogleEvents(googleRequest): Timeslot[] {
  //   return this.googleService.parseEvents(googleRequest);
  // }

  getEvents(minTime: Date, inviteeIDs: string[], priorityList: string[]): Observable<Timeslot[]> {
    console.log(inviteeIDs);
    let body = {
      minTime: minTime,
      userIDs: inviteeIDs,
      priorities: priorityList
    }
    return this.http.post<Timeslot[]>(`${environment.apiUrl}/calendars/`, body);
  }

  // // Checks the calendar for type and calls the according function
  // switchCaseCalendar(calendar: Calendar, minTime: Date) {
  //   switch (calendar.type) {
  //     case CalType.GOOGLE:
  //       return (this.googleService.getBusyEvents(calendar.accessIdentifier, minTime));
  //       break;
  //     case CalType.APPLE:
  //       break;
  //     case CalType.MICROSOFT:
  //       break;
  //     case CalType.ICS:
  //       break;
  //     default:
  //       break;
  //   }
  // }

  // Calls deletion of calendar on the backend
  deleteCalendar(calendarToDelete: Calendar) {
    return this.http.delete(`${environment.apiUrl}/calendars/${this.authService.currentUserValue._id}/${calendarToDelete._id}`);
  }
}
