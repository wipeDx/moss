import { Component, OnInit } from '@angular/core';
import { MeetingsService } from 'src/app/services/meetings/meetings.service';
import { AlertService } from 'src/app/services/alert/alert.service';
import { Meeting } from 'src/app/models/meeting';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor(
    private meetingService: MeetingsService,
    private alertService: AlertService) { }

  ngOnInit() {
  }

  meetings: Meeting[];

  meetingsFuncCreated() {
    this.meetingService.getCreatedMeetingsDashboard().subscribe(
      data => {
        console.log(data);
        this.meetings = data;
      },
      error => {
        this.alertService.error('Error while fetching created meetings data');
      }
    );
  }
  meetingsFuncUnanswered() {
    this.meetingService.getMeetingsThatUserIsInvitedToDashboard().subscribe(
      data => {
        console.log(data);
        this.meetings = data;
      },
      error => {
        this.alertService.error('Error while fetching unanswered meetings data');
      }
    );
  }
}
