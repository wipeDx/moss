import { Component, OnInit } from '@angular/core';
import { Meeting } from 'src/app/models/meeting';
import { MeetingsService } from 'src/app/services/meetings/meetings.service';
import { AlertService } from 'src/app/services/alert/alert.service';

@Component({
  selector: 'app-meetings-current',
  templateUrl: './meetings-current.component.html',
  styleUrls: ['./meetings-current.component.css']
})
export class MeetingsCurrentComponent implements OnInit {

  meetings: Meeting[];

  constructor(
    private meetingService: MeetingsService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
  }

  getCurrentMeetings() {
    this.meetingService.getMeetingsThatUserIsInvitedTo().subscribe(
      data => this.meetings = data,
      error => {}
    )
  }
}
