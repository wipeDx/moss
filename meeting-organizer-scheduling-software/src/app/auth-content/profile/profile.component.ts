import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/models/user';
import { Calendar } from 'src/app/models/calendar';
import { faTrash, faTimes, faSave, faCalendarPlus, faCalendar, faKey, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { GoogleService } from 'src/app/services/calendars/google/google.service';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/services/user/user.service';
import { MicrosoftService } from 'src/app/services/calendars/microsoft/microsoft.service';
import { CalType } from "../../models/calendar";
import { CalendarService } from 'src/app/services/calendars/calendar.service';
import { AlertService } from 'src/app/services/alert/alert.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AppleService } from 'src/app/services/calendars/apple/apple.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  iconCalendar = faCalendar;
  iconCredentials = faKey;
  iconDangerZone = faExclamationTriangle;

  deleteButton = faTrash;
  iconCancel = faTimes;
  iconSave = faSave;

  constructor() {
  }

  ngOnInit() {
  }

}
