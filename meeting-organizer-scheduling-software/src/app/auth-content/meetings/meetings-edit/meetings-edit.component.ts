import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MeetingsService } from 'src/app/services/meetings/meetings.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StepDetailsComponent } from '../meetings-create/step-details/step-details.component';
import { CalendarComponent } from '../../calendar/calendar.component';
import { UnsavedDataPromptService } from 'src/app/services/unsaved-data-prompt/unsaved-data-prompt.service';
import { Observable } from 'rxjs';
import { AlertService } from 'src/app/services/alert/alert.service';
import { faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-meetings-edit',
  templateUrl: './meetings-edit.component.html',
  styleUrls: ['./meetings-edit.component.css']
})
export class MeetingsEditComponent implements OnInit, OnDestroy {

  @ViewChild(StepDetailsComponent, {static: true} ) child: StepDetailsComponent; 
  sendNotificationToInvitees: boolean;
  meetingID: string;

  iconDelete = faTrash;
  iconCancel = faTimes;

  constructor(
    private meetingService: MeetingsService,
    private route: ActivatedRoute,
    private router: Router,
    private unsavedDataPrompt: UnsavedDataPromptService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.sendNotificationToInvitees = false;
    this.meetingID = this.route.snapshot.url[2].path;
    this.router.navigate(['meetings', 'edit', this.meetingID, 'details'], { skipLocationChange: true });
  }

  ngOnDestroy() {
    this.meetingService.resetMeetingValues();
    console.log("Destroyed meetingservice data");
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (!this.meetingService.hasChangedInputs()) {
      return true;
    }

    return this.unsavedDataPrompt.confirm();
  }

  deleteMeeting() {
    console.log(this.sendNotificationToInvitees);
    this.meetingService.deleteMeeting(this.meetingID, this.sendNotificationToInvitees).subscribe(
      data => {
        this.alertService.success('Meeting successfully deleted', true);
        this.router.navigateByUrl('/meetings');
      },
      error => {
        this.alertService.error('Error while deleting the meeting', true);
      }
    );
  }

}
