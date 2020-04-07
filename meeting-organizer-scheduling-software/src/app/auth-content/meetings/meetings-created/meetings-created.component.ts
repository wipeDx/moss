import { Component, OnInit } from '@angular/core';
import { MeetingsService } from 'src/app/services/meetings/meetings.service';
import { Meeting } from 'src/app/models/meeting';

@Component({
  selector: 'app-meetings-created',
  templateUrl: './meetings-created.component.html',
  styleUrls: ['./meetings-created.component.css']
})
export class MeetingsCreatedComponent implements OnInit {

  constructor(private meetingService: MeetingsService) { }

  meetings: Meeting[];
  
  ngOnInit() {
    this.getCreatedMeetings();
  }

  getCreatedMeetings() {
    this.meetingService.getCreatedMeetings().subscribe(
      data => this.meetings = data
    )
  }

}
