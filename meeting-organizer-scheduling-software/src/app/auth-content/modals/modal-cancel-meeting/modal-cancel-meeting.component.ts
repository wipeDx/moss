import { Component, OnInit, Input } from '@angular/core';
import { Meeting } from 'src/app/models/meeting';
import { MeetingsService } from 'src/app/services/meetings/meetings.service';
import { AlertService } from 'src/app/services/alert/alert.service';
import { Router } from '@angular/router';
import { faWindowClose, faTimes } from '@fortawesome/free-solid-svg-icons';
declare var $: any;

@Component({
  selector: 'app-modal-cancel-meeting',
  templateUrl: './modal-cancel-meeting.component.html',
  styleUrls: ['./modal-cancel-meeting.component.css']
})
export class ModalCancelMeetingComponent implements OnInit {

  @Input() meeting: Meeting;
  loading: boolean;
  cancelButtonMeeting = faWindowClose;
  cancelButton = faTimes;

  constructor(
    private meetingService: MeetingsService,
    private alertService: AlertService,
    private router: Router) { }

  ngOnInit() {
    this.loading = false;
  }

  cancelMeeting() {
    this.loading = true;
    this.meetingService.cancelMeeting(this.meeting).subscribe(
      data => {
        this.loading = false;
        this.alertService.success("Successfully cancelled meeting", true);
        this.router.navigateByUrl('/meetings/created');
        $('#modalCancelMeeting').modal('hide');
      },
      error => {
        this.loading = false;
        this.alertService.error("Error during cancellation of meeting", true);
        this.router.navigateByUrl('/meetings/created');
      }
    );
  }

}
