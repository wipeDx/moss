import { Component, OnInit } from '@angular/core';
import { MeetingsService } from 'src/app/services/meetings/meetings.service';
import { Meeting } from 'src/app/models/meeting';

@Component({
  selector: 'app-meetings-past',
  templateUrl: './meetings-past.component.html',
  styleUrls: ['./meetings-past.component.css']
})
export class MeetingsPastComponent implements OnInit {

  meetings: Meeting[];

  constructor(
    private meetingService: MeetingsService
  ) { }

  ngOnInit() {
  }

  getPastMeetings() {
    this.meetingService.getMeetingsThatAreDone().subscribe(
      data => this.meetings = data
    )
  }

}
