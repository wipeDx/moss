import { Component, OnInit } from '@angular/core';
import { faCalendar, faCalendarPlus, faCalendarCheck, faPlus } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-meetings',
  templateUrl: './meetings.component.html',
  styleUrls: ['./meetings.component.css']
})
export class MeetingsComponent implements OnInit {

  buttonCurrent = faCalendar;
  buttonCreated = faCalendarPlus;
  buttonPast = faCalendarCheck;
  buttonCreate = faPlus;

  constructor() { }

  ngOnInit() {
  }

}
