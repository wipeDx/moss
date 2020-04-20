import { Component, OnInit, ViewChild, HostListener, AfterViewInit, AfterContentInit, Input } from '@angular/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGrigPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import bootstrapPlugin from '@fullcalendar/bootstrap';
import deLocale from '@fullcalendar/core/locales/de';
import enGbLocale from '@fullcalendar/core/locales/en-gb';
import { Calendar } from '@fullcalendar/core';
import { MeetingsService } from 'src/app/services/meetings/meetings.service';
import { Timeslot } from 'src/app/models/timeslot';
import { TranslateService } from '@ngx-translate/core';
import SHA3 from 'sha3';
import { ModalTimeslotEditComponent } from '../meetings/modal-timeslot-edit/modal-timeslot-edit.component';
import { AlertService } from 'src/app/services/alert/alert.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements AfterViewInit {

  @ViewChild('calendar') calendarComponent: FullCalendarComponent; // the #calendar in the template
  @ViewChild(ModalTimeslotEditComponent) modalTimeslotEditor: ModalTimeslotEditComponent;

  locales = [enGbLocale, deLocale];

  calendarApi: Calendar;
  hash = new SHA3(512);

  aspectRatio: number;

  calendarPlugins = [
    interactionPlugin,
    dayGridPlugin,
    timeGrigPlugin,
    bootstrapPlugin
  ];

  @Input() calendarEvents: Timeslot[];
  @Input() selectedTimeslots: Map<string, Timeslot>;

  constructor(
    private meetingService: MeetingsService,
    public translate: TranslateService,
    private alertService: AlertService) { }
  addEvent(event: Timeslot) {
    this.calendarEvents.push(event);
    this.selectedTimeslots.set(event.extendedProps.hashID, event);
    this.updateMeetingService();
  }

  hashEvent(startTime: Date, endTime: Date) {
    this.hash.update(Date.now() + startTime.toString() + endTime.toString());
    let hashed = this.hash.digest('hex');
    this.hash.reset();
    return hashed;
  }

  modifyEventTime(modifyEvent) {
    const eventHashID = modifyEvent.event._def.extendedProps.hashID;
    let modifiedEventTimeslot = this.selectedTimeslots.get(eventHashID);
    
    if (modifyEvent.delta) {
      this.applyDelta(modifiedEventTimeslot, modifyEvent.delta, false);
    }
    else if (modifyEvent.endDelta) {
      this.applyDelta(modifiedEventTimeslot, modifyEvent.endDelta, true);
    }
  }

  applyDelta(event: Timeslot, delta: any, end: boolean) {
    let millisecondsOffset = 0;
    if (delta.days) {
      millisecondsOffset += 86400000 * delta.days;
    }
    if (delta.milliseconds) {
      millisecondsOffset += delta.milliseconds;
    }
    if (delta.months) {
      millisecondsOffset += 2629800000 * delta.months;
    }
    if (delta.years) {
      millisecondsOffset += 31557600000 * delta.years;
    }
    if (!end) {
      event.start.setTime(event.start.getTime() + millisecondsOffset);
    }
    event.end.setTime(event.end.getTime() + millisecondsOffset);
  }

  // Takes a changed event object and applies it
  changeCalenderEvent($event) {
    var eventOne = this.selectedTimeslots.get($event.eventHashID);
    var eventTwo = this.getCalendarEventFromHashID($event.eventHashID);

    eventOne.start = $event.newStart;
    eventOne.end = $event.newEnd;
    eventOne.title = $event.newTitle;
    eventTwo.start = $event.newStart;
    eventTwo.end = $event.newEnd;
    eventTwo.title = $event.newTitle;
    console.log(eventOne);
  }

  // Has to be an old-school for loop in order to return efficiently
  getCalendarEventFromHashID(hashID: string) {
    for (var i = 0; i < this.calendarEvents.length; i++) {      
      if (this.calendarEvents[i].extendedProps && this.calendarEvents[i].extendedProps.hashID.toString() === hashID) {
        return this.calendarEvents[i];
      }
    }
    return undefined;
  }

  // Deletes from the calEvents array by filtering
  deleteFromCalEvents(hashID: string) {
    this.calendarEvents = this.calendarEvents.filter(slot => !slot.extendedProps || slot.extendedProps.hashID !== hashID);
  }
  
  /**
   * Whenever a created timeslot gets clicked.
   * Calls the modal where you can edit time, title and delete it
   */
  handleEventClick($event) {
    const eventHashID = $event.event._def.extendedProps.hashID;
    if (this.selectedTimeslots.get(eventHashID) === undefined) {
      return;
    }
    this.modalTimeslotEditor.setEventToEdit(this.selectedTimeslots.get(eventHashID));
    this.modalTimeslotEditor.openModal();
    console.log($event);
  }

  handleEventDragStop($event) {
    console.log("Event dragged")
    console.log($event);
    this.modifyEventTime($event);
    //this.setCalendarEvents(this.modifyEventTime($event, this.selectedTimeslots));
  }
  
  handleEventResizeStop($event) {
    console.log("Event resized")
    console.log($event);
    this.modifyEventTime($event);
    //this.setCalendarEvents(this.modifyEventTime($event, this.selectedTimeslots));
  }

  handleEventSelect($event) {
    console.log($event);
    const uid = Date.now()
    this.addEvent({ 
      id: this.calendarEvents.length,
      title: 'Selected Timeslot',
      start: $event.start,
      end: $event.end,
      extendedProps: {
        hashID: this.hashEvent($event.start, $event.end)
        } 
      });
    this.calendarComponent.getApi().unselect();
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

  updateMeetingService() {
    this.meetingService.changeHasInputChanged();
    this.meetingService.changeCalendarEvents(this.calendarEvents);
    this.meetingService.changeSelectedTimeslots(this.selectedTimeslots);
    //console.log(this.meetingService.calendarEvents.value);
  }

  ngAfterViewInit(): void {
    setTimeout(()=> {
      this.recalculateAspectRatio();
    }, 0);
  }

}
