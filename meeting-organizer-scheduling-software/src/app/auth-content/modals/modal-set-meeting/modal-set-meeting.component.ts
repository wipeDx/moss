import { Component, OnInit, Input } from '@angular/core';
import { Meeting } from 'src/app/models/meeting';
import { MeetingsService } from 'src/app/services/meetings/meetings.service';
import { AlertService } from 'src/app/services/alert/alert.service';
import { Router } from '@angular/router';
import { faCheckSquare, faTimes } from '@fortawesome/free-solid-svg-icons';
declare var $: any

@Component({
  selector: 'app-modal-set-meeting',
  templateUrl: './modal-set-meeting.component.html',
  styleUrls: ['./modal-set-meeting.component.css']
})
export class ModalSetMeetingComponent implements OnInit {

  @Input() meeting: Meeting;
  loading: boolean;
  setButton = faCheckSquare;
  cancelButton = faTimes;

  constructor(
    private meetingService: MeetingsService,
    private alertService: AlertService,
    private router: Router) { }

  ngOnInit() {
    this.loading = false;
  }

  setMeeting() {
    this.loading = true;
    this.meetingService.setMeeting(this.meeting).subscribe(
      data => {
        this.loading = false;
        this.alertService.success("Successfully set meeting", true);
        this.router.navigateByUrl('/meetings/created');
        $('#modalSetMeeting').modal('hide');
      },
      error => {
        this.loading = false;
        this.alertService.error("Error during setting of meeting", true);
        this.router.navigateByUrl('/meetings/created');
      }
    );
  }

}
