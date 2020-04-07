import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Timeslot, Color } from 'src/app/models/timeslot';
import { User } from 'src/app/models/user';
import { Meeting, Interval, EmptyMeeting, State } from 'src/app/models/meeting';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Attendee, AnswerState } from 'src/app/models/attendee';
import { Calendar } from 'src/app/models/calendar';
import { AuthService } from 'src/app/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class MeetingsService {

  

  constructor(
    private http: HttpClient,
    private authService: AuthService
    ) { }

  deleteMeeting(meetingID: string, notifyInvitees: boolean) {
    return this.http.delete(`${environment.apiUrl}/meetings/${meetingID}/${notifyInvitees}`);
  }
  
  /**
   * 
   * @param settings 
   * @param inviteeList 
   */
  findMeetingTimeslots(settings: any, inviteeList: string[]) {
    inviteeList.push(this.authService.currentUserValue._id);
    return this.http.post(`${environment.apiUrl}/meetings/automatic-time-slot-search`, {'settings': settings, 'inviteeList': inviteeList});
  }

  createMeeting(meeting: Meeting) {
    return this.http.post(`${environment.apiUrl}/meetings`, meeting);
  }

  editMeeting(meeting: Meeting) {
    return this.http.patch(`${environment.apiUrl}/meetings/${meeting._id}`, meeting);
  }

  cancelMeeting(meeting: Meeting) {
    meeting.state = State.CANCELLED;
    return this.editMeeting(meeting);
  }

  setMeeting(meeting: Meeting) {
    meeting.state = State.COMPLETED;
    return this.editMeeting(meeting);
  }

  hasChangedInputs() {
    return this.changedInputs;
  }

  parseMeeting(meeting: Meeting) {
    this.changeCommentBox(meeting.comment);
    this.changeEventLocation(meeting.location);
    this.changeEventName(meeting.name);
    this.changeRepeating(meeting.repeating);
    if (meeting.repeating) {
     this.changeRepeatingCount(meeting.repeatingCount.toString());
     this.changeRepeatingInterval(meeting.repeatingInterval);
    }
    // Parse timeslots
    let timeslots: Timeslot[] = [];
    let timeslotMap = new Map<string, Timeslot>();
    for (var i = 0; i < meeting.timeslots.length; i++) {
      let timeslot: Timeslot = {
        title: meeting.timeslots[i].title,
        start: new Date(meeting.timeslots[i].start),
        end: new Date(meeting.timeslots[i].end),
        extendedProps: meeting.timeslots[i].extendedProps
      };
      timeslots.push(timeslot);
      timeslotMap.set(meeting.timeslots[i].extendedProps.hashID, timeslot);
    }
    this.changeSelectedTimeslots(timeslotMap);
    if (!this.fetchedForeignCalendars) {
      this.changeCalendarEvents(timeslots);
    }

    // Parse attendees and users
    let attendees = new Map<string, Attendee>();
    let user = new Map<string, User>();
    meeting.attendees.forEach(attendee => {
      user.set(attendee.userID.email, attendee.userID)
      attendees.set(attendee.userID.email, attendee)
    })

    this.changeAddedMembersAttendee(attendees);
    this.changeAddedMembersUser(user);
  }

  getCreatedMeetings(): Observable<Meeting[]> {
    return this.http.get<Meeting[]>(`${environment.apiUrl}/meetings/by-owner/${this.authService.currentUserValue._id}`);
  }
  getCreatedMeetingsDashboard(): Observable<Meeting[]> {
    return this.http.get<Meeting[]>(`${environment.apiUrl}/meetings/by-owner/${this.authService.currentUserValue._id}/dashboard`);
  }

  getMeetingsThatAreDone(): Observable<Meeting[]> {
    return this.http.get<Meeting[]>(`${environment.apiUrl}/meetings/by-done/${this.authService.currentUserValue._id}`);
  }

  getMeetingsThatUserIsInvitedTo(): Observable<Meeting[]> {
    return this.http.get<Meeting[]>(`${environment.apiUrl}/meetings/by-invitee/${this.authService.currentUserValue._id}`);
  }
  getMeetingsThatUserIsInvitedToDashboard(): Observable<Meeting[]> {
    return this.http.get<Meeting[]>(`${environment.apiUrl}/meetings/by-invitee/${this.authService.currentUserValue._id}/dashboard`);
  }

  getMeeting(id: string): Observable<Meeting> {
    return this.http.get<Meeting>(`${environment.apiUrl}/meetings/${id}`);
  }

  acceptMeeting(meeting: Meeting, customAnswer: string): Observable<any> {
    return this.attendeeAnswer(AnswerState.YES, meeting, customAnswer);
  }

  declineMeeting(meeting: Meeting, customAnswer: string): Observable<any> {
    return this.attendeeAnswer(AnswerState.NO, meeting, customAnswer);
  }

  changeHasInputChanged() {
    this.changedInputs = true;
  }

  attendeeAnswer(answer: AnswerState, meeting: Meeting, customAnswer: string): Observable<any> {
    let body = {
      attendeeID: this.authService.currentUserValue._id,
      answerState: answer,
      customAnswer: customAnswer
    }

    return this.http.patch(`${environment.apiUrl}/meetings/${meeting._id}/updateAttendee`, body);
  }

  calendarEvents = new BehaviorSubject([]);
  selectedTimeslots = new BehaviorSubject(new Map<string, Timeslot>());
  eventName = new BehaviorSubject("");
  eventLocation = new BehaviorSubject("");
  invitedPeople = new BehaviorSubject([]);
  commentBox = new BehaviorSubject("");
  repeating = new BehaviorSubject(false);
  repeatingCount = new BehaviorSubject("");
  repeatingInterval = new BehaviorSubject(Interval.NONE);
  addedMembersUser = new BehaviorSubject(new Map<string, User>());
  addedMembersAttendee = new BehaviorSubject(new Map<string, Attendee>());
  meetingToEdit = new BehaviorSubject(EmptyMeeting);
  changedInputs = false;
  fetchedForeignCalendars = false;
  editFetchedInitialMeeting = false;

  getCalendarsOfAddedMembers(): Calendar[] {
    let calendars: Calendar[] = [];
    this.addedMembersUser.value.forEach((user,email) => {
      calendars.push(user.calendars);
    });
    return calendars;
  }

  getAttendeeIDsOfMeeting(): string[] {
    let attendees: string[] = [];
    console.log(this.addedMembersAttendee.value);
    this.addedMembersAttendee.value.forEach((attendee,email) => {
      attendees.push(attendee.userID._id)
    });
    return attendees;
  }
  changeFetchedForeignCalendars(fetched: boolean) {
    this.fetchedForeignCalendars = fetched;
  }
  changeEditFetchedInitialMeeting(fetched: boolean) {
    this.editFetchedInitialMeeting = fetched;
  }
  changeMeetingToEdit(meeting: Meeting) {
    this.meetingToEdit.next(meeting);
  }
  changeAddedMembersUser(members: Map<string, User>) {
    this.addedMembersUser.next(members);
  }
  changeAddedMembersAttendee(members: Map<string, Attendee>) {
    this.addedMembersAttendee.next(members);
  }
  changeCalendarEvents(events: Timeslot[]) {
    this.calendarEvents.next(events);
  }
  changeSelectedTimeslots(events: Map<string, Timeslot>) {
    this.selectedTimeslots.next(events);
  }
  changeEventName(name: string) {
    this.eventName.next(name);
  }
  changeEventLocation (location: string) {
    this.eventLocation.next(location);
  }
  changeInvitedPeople (invitedPeople) {
    this.invitedPeople.next(invitedPeople);
  }
  changeCommentBox (commentBox: string) {
    this.commentBox.next(commentBox);
  }
  changeRepeating (repeating: boolean) {
    this.repeating.next(repeating);
  }
  changeRepeatingCount (repeatingCount: string) {
    this.repeatingCount.next(repeatingCount);
  }
  changeRepeatingInterval (repeatingInterval: Interval) {
    this.repeatingInterval.next(repeatingInterval);
  }
  resetMeetingValues() {
    this.calendarEvents = new BehaviorSubject([]);
    this.selectedTimeslots = new BehaviorSubject(new Map<string, Timeslot>());;
    this.eventName = new BehaviorSubject("");
    this.eventLocation = new BehaviorSubject("");
    this.invitedPeople = new BehaviorSubject([]);
    this.commentBox = new BehaviorSubject("");
    this.repeating = new BehaviorSubject(false);
    this.repeatingCount = new BehaviorSubject("");
    this.repeatingInterval = new BehaviorSubject(Interval.NONE);
    this.addedMembersUser = new BehaviorSubject(new Map<string, User>());
    this.addedMembersAttendee = new BehaviorSubject(new Map<string, Attendee>());
    this.meetingToEdit = new BehaviorSubject(EmptyMeeting);
    this.changedInputs = false;
    this.fetchedForeignCalendars = false;
    this.editFetchedInitialMeeting = false;
  }
}
