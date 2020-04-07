import { Component, OnInit, Input } from '@angular/core';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/auth/auth.service';
import { Meeting, EmptyMeeting } from 'src/app/models/meeting';
import { MeetingsService } from 'src/app/services/meetings/meetings.service';
import { faEdit, faCheckSquare, faWindowClose } from '@fortawesome/free-solid-svg-icons';
import { AnswerState } from 'src/app/models/attendee';
import { AlertService } from 'src/app/services/alert/alert.service';
declare var $: any;

@Component({
  selector: 'app-meetings-list',
  templateUrl: './meetings-list.component.html',
  styleUrls: ['./meetings-list.component.css']
})
export class MeetingsListComponent implements OnInit {

  currentUser: User;
  editButton = faEdit;
  setButton = faCheckSquare;
  cancelButton = faWindowClose;

  meetingToSet: Meeting;
  meetingToCancel: Meeting;

  @Input() meetingsFunc;
  meetings: Meeting[];

  constructor(
    private authService: AuthService,
    private meetingService: MeetingsService,
    private alertService: AlertService
    ) {
    this.currentUser = authService.currentUserValue;
  }

  ngOnInit() {
    this.meetingsFunc();
    this.meetingToSet = EmptyMeeting;
    this.meetingToCancel = EmptyMeeting;
  }

  getAnswerCount(meeting: Meeting) {
    let count = 0;
    meeting.attendees.forEach(attendee => attendee.answerState !== AnswerState.NONE ? count++ : count);
    return count;
  }

  getLocaleDateString(date: any) {
    const actualDate = new Date(date)
    return actualDate.toLocaleString();
  }

  setMeetingToSet (meeting: Meeting) {
    this.meetingToSet = meeting;
    $('#modalSetMeeting').modal('show');
  }
  setMeetingToCancel (meeting: Meeting) {
    this.meetingToCancel = meeting;
    $('#modalCancelMeeting').modal('show');
  }
}
