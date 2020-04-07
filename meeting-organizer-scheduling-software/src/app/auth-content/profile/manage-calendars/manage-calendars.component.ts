import { Component, OnInit } from '@angular/core';
import { faCalendarPlus, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';
import { CalType, Calendar } from 'src/app/models/calendar';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/auth/auth.service';
import { GoogleService } from 'src/app/services/calendars/google/google.service';
import { MicrosoftService } from 'src/app/services/calendars/microsoft/microsoft.service';
import { AppleService } from 'src/app/services/calendars/apple/apple.service';
import { UserService } from 'src/app/services/user/user.service';
import { CalendarService } from 'src/app/services/calendars/calendar.service';
import { AlertService } from 'src/app/services/alert/alert.service';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-manage-calendars',
  templateUrl: './manage-calendars.component.html',
  styleUrls: ['./manage-calendars.component.css']
})
export class ManageCalendarsComponent implements OnInit {

  iconAddCalendar = faCalendarPlus;
  existingCalendars: Calendar[];
  calendarToDelete: Calendar;
  CalType = CalType;
  currentUser: User;
  iconDelete = faTrash;
  iconCancel = faTimes;


  constructor(
    private authService: AuthService,
    private googleService: GoogleService,
    private microsoftService: MicrosoftService,
    private appleService: AppleService,
    private userService: UserService,
    private calendarService: CalendarService,
    private alertService: AlertService,
    private router: Router
    ) {
      this.currentUser = authService.currentUserValue;
  }

  ngOnInit() {
    this.existingCalendars = this.authService.currentUserValue.calendars;
    this.userService.getAllCalendars().subscribe(calendars => this.existingCalendars = calendars);
    this.calendarToDelete = Calendar.EmptyCalendar;
    console.log(this.existingCalendars);
  }

  handleCalendarConnection(calendarConnect) {
    switch(calendarConnect.selection) {
      case CalType.GOOGLE:
        this.signInGoogle();
        break;
      case CalType.MICROSOFT:
        this.signInMicrosoft();
        break;
      case CalType.APPLE:
        this.signInApple();
        break;
      case CalType.ICS:
        this.handleICS();
        break;
      default:
        break;
    }
  }

  handleICS() {
    this.router.navigateByUrl('/profile/calendars/auth/ics');
  }

  signInGoogle() {
    var url = this.googleService.getOAuthURL();
    window.location.href = url;
  }

  signInApple() {
    this.appleService.getAuthUrl().subscribe(
      url => window.location.href = url,
      err => this.alertService.error(`Could not get Apple Sign in URL: ${err}`)
    )
  }

  updateCalendarToDelete(calendar: Calendar) {
    this.calendarToDelete = calendar;
  }

  deleteCalendar() {
    this.calendarService.deleteCalendar(this.calendarToDelete).subscribe(
      data => {
        this.alertService.success('Calendar successfully deleted');
        this.authService.updateCurrentUser();
        this.userService.getAllCalendars().subscribe(data => this.existingCalendars = data);
        $('#dangerDeleteCalendarModal').modal('hide');
      },
      error => this.alertService.error(`Error while deleting calendar`)
    );
    this.calendarToDelete = Calendar.EmptyCalendar;
  }

  async signInMicrosoft(): Promise<void> {
    await this.microsoftService.signIn();
  }

}
