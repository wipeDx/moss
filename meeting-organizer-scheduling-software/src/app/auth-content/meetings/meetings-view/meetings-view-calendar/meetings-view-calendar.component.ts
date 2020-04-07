import { Component, OnInit, ViewChild, HostListener, AfterViewInit, AfterContentInit, Input } from '@angular/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGrigPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import bootstrapPlugin from '@fullcalendar/bootstrap';
import deLocale from '@fullcalendar/core/locales/de';
import enGbLocale from '@fullcalendar/core/locales/en-gb';
import { Calendar } from '@fullcalendar/core';
import { stringify } from 'querystring';
import { MeetingsService } from 'src/app/services/meetings/meetings.service';
import { Timeslot, EmptyTimeslot } from 'src/app/models/timeslot';
import { TranslateService } from '@ngx-translate/core';
import { ModalTimeslotEditComponent } from '../../modal-timeslot-edit/modal-timeslot-edit.component';
declare var $: any;

@Component({
  selector: 'app-meetings-view-calendar',
  templateUrl: './meetings-view-calendar.component.html',
  styleUrls: ['./meetings-view-calendar.component.css']
})
export class MeetingsViewCalendarComponent implements OnInit, AfterViewInit {

  eventToEdit: Timeslot;

  @ViewChild('calendar', {static: false}) calendarComponent: FullCalendarComponent; // the #calendar in the template
  locales = [enGbLocale, deLocale];
  calendarApi: Calendar;
  aspectRatio: number;
  calendarPlugins = [
    dayGridPlugin,
    timeGrigPlugin,
    bootstrapPlugin
  ];

  @ViewChild(ModalTimeslotEditComponent, {static: false}) timeslotModal: ModalTimeslotEditComponent;

  @Input() calendarEvents: Timeslot[];
  @Input() timeRange: any;
  

  constructor(public translate: TranslateService) { }

  ngOnInit() {
    this.eventToEdit = EmptyTimeslot;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.recalculateAspectRatio();
  }

  recalculateAspectRatio() {
    let rect = document.getElementById('meeting-create-calendar').getBoundingClientRect();
    let leftoverHeight = window.innerHeight - rect.top - 150;
    let width = rect.width;

    this.aspectRatio = width / leftoverHeight;
  }

  // Not guaranteed to work
  /**
   * When clicking the event, this function will be called and look for
   * a matching Timeslot in the calendarEvents array.
   */
  handleEventClick($event) {
    let clicked_start = new Date($event.event._instance.range.start);
    let clicked_end = new Date($event.event._instance.range.end);
    const offset = (new Date().getTimezoneOffset()) / 60;

    clicked_start.setUTCHours(clicked_start.getUTCHours() + offset);
    clicked_end.setUTCHours(clicked_end.getUTCHours() + offset);

    // find correspondending event in the array
    this.calendarEvents.forEach(event => {
      let event_start = new Date(event.start);
      let event_end = new Date(event.end);
      if (clicked_start.toISOString() == event_start.toISOString() &&
          clicked_end.toISOString() == event_end.toISOString()) {
        this.eventToEdit = event;
        this.eventToEdit.start = event_start;
        this.eventToEdit.end = event_end;
      }
    });
    
    this.timeslotModal.setEventToEdit(this.eventToEdit);
    // Open Modal to propose changes to timeslot
    this.timeslotModal.openModal();
    // Debug in order to check how editing works
    // console.log(eventToEdit);
    // eventToEdit.start = new Date(eventToEdit.start);
    // eventToEdit.start.setHours(0);
  }

  ngAfterViewInit(): void {
    setTimeout(()=> {
      this.recalculateAspectRatio();
    }, 150);
  }

}
 