import { Component, OnInit } from '@angular/core';
import { MeetingsService } from 'src/app/services/meetings/meetings.service';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { Timeslot } from 'src/app/models/timeslot';
import { Meeting, State } from 'src/app/models/meeting';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/auth/auth.service';
import { Attendee, AnswerState, Priority } from 'src/app/models/attendee';
import { AlertService } from 'src/app/services/alert/alert.service';
import { CalendarService } from 'src/app/services/calendars/calendar.service';
import { Router, ActivatedRoute } from '@angular/router';
import { faTrash, faTimes, faSave, faPlus, faStepBackward, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
declare var $: any;

@Component({
  selector: 'app-step-calendar',
  templateUrl: './step-calendar.component.html',
  styleUrls: ['./step-calendar.component.css']
})
export class StepCalendarComponent implements OnInit {

  calendarEvents: Timeslot[];     // All Timeslots shown in the calendar
  selectedTimeslots: Map<string, Timeslot>;  // Only selected timeslots for possible meetings

  iconDelete = faTrash;
  iconCancel = faTimes;
  iconSave = faSave;
  iconAdd = faPlus;
  iconBack = faStepBackward;
  iconChooseTimes = faCalendarAlt;

  loading: boolean;
  loadingCalendars: boolean;
  isEditing: boolean;

  constructor(
    private meetingService: MeetingsService,
    private authService: AuthService,
    private alertService: AlertService,
    private calendarService: CalendarService,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.selectedTimeslots = this.meetingService.selectedTimeslots.value;
    this.calendarEvents = this.meetingService.calendarEvents.value;

    this.loading = false;
    this.isEditing = this.checkIsEditing();
    if (!this.meetingService.fetchedForeignCalendars) {
      this.loadingCalendars = true;
      this.concatCalendarEvents();
    }
    //console.log(this.calendarEvents);
  }

  /**
   * Checks whether the url contains editing und thus returns true or false
   */
  checkIsEditing() {
    return window.location.href.includes('meetings/edit/');
  }

  openAutomaticSelection() {
    console.log("click");
    console.log($('#modalAutomaticSelection').modal('show'));
  }

  // Gets promises of all invitees and logged in user's calendar's events
  // and then concats them into the event array that displays all the event on the browser
  concatCalendarEvents() {
    let inviteeList = [];
    let priorityList = [];
    console.log(this.meetingService.addedMembersAttendee.value);
    console.log(this.meetingService.addedMembersUser.value);
    this.meetingService.addedMembersAttendee.value.forEach((user, key) => {
      inviteeList.push(user.userID);
      priorityList.push(user.priority);
    })
    inviteeList.push(this.authService.currentUserValue._id);
    priorityList.push(Priority.MOST_IMPORTANT);

    this.calendarService.getEvents(new Date(Date.now() - 5), inviteeList, priorityList).subscribe(
      data => {
        this.calendarEvents = data;
        if (this.isEditing) {
          this.calendarEvents = this.calendarEvents.concat(this.meetingService.meetingToEdit.value.timeslots);
        }
        this.meetingService.changeCalendarEvents(this.calendarEvents);
        console.log(this.calendarEvents);
        this.loadingCalendars = false;
        this.meetingService.changeFetchedForeignCalendars(true);
      },
      error => {
        console.log("error" + error)
      }
    );
  }

  prepareMeeting(meetingID?: string): Meeting {
    this.loading = true;
    let meeting = new Meeting();
    if (meetingID) {
      meeting._id = meetingID;
    }
    let timeslots: Timeslot[] = [];
    this.meetingService.selectedTimeslots.value.forEach((slot, _) => timeslots.push(slot));
    meeting.name = this.meetingService.eventName.value;
    meeting.comment = this.meetingService.commentBox.value;
    meeting.location = this.meetingService.eventLocation.value;
    meeting.repeating = this.meetingService.repeating.value;
    meeting.repeatingCount = parseInt(this.meetingService.repeatingCount.value);
    meeting.repeatingInterval = this.meetingService.repeatingInterval.value;
    meeting.timeslots = timeslots;
    meeting.attendees = this.convertListToAttendees(this.meetingService.addedMembersAttendee.value);
    meeting.state = State.PENDING_ANSWERS;
    meeting.creator = this.authService.currentUserValue._id;
    return meeting;
  }

  onSubmitEdit() {
    let meeting = this.prepareMeeting(this.meetingService.meetingToEdit.value._id);
    this.meetingService.editMeeting(meeting).subscribe(
      data => {
        console.log(data);
        this.loading = false;
        this.alertService.success('Meeting successfully edited', true);
        this.meetingService.resetMeetingValues();
        this.router.navigateByUrl('/meetings/created');
      },
      error => {
        this.alertService.error(`Error creating meeting`, true);
      })
  }

  onSubmit() {
    let meeting = this.prepareMeeting()
    this.meetingService.createMeeting(meeting).subscribe(
      data => {
        console.log(data);
        this.loading = false;
        this.alertService.success('Meeting successfully created', true);
        this.meetingService.resetMeetingValues();
        this.router.navigateByUrl('/meetings/created');
      },
      error => {
        this.alertService.error(`Error creating meeting`, true);
      }
    )
  }
  
  // Simple function to convert a list of users into a list of their ids only
  convertListToAttendees(attendees: Map<string, Attendee>): Attendee[] {
    let list: Attendee[] = [];
    // Only grabs the user and ignores email part
    attendees.forEach(attendee => {
      list.push(attendee);
    });
    return list;
  }
}
