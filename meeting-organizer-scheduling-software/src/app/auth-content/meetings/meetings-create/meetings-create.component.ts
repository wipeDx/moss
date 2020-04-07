import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MeetingsService } from 'src/app/services/meetings/meetings.service';
import { Observable } from 'rxjs';
import { UnsavedDataPromptService } from 'src/app/services/unsaved-data-prompt/unsaved-data-prompt.service';

@Component({
  selector: 'app-meetings-create',
  templateUrl: './meetings-create.component.html',
  styleUrls: ['./meetings-create.component.css']
})
export class MeetingsCreateComponent implements OnInit, OnDestroy {


  constructor(
    private router: Router,
    private meetingService: MeetingsService,
    private unsavedDataPrompt: UnsavedDataPromptService
    ) { }

  ngOnInit() {
    this.router.navigate(['meetings', 'create', 'details'], { skipLocationChange: true });
  }

  ngOnDestroy() {
    this.meetingService.resetMeetingValues();
  }
  
  canDeactivate(): Observable<boolean> | boolean {
    if (!this.meetingService.hasChangedInputs()) {
      return true;
    }

    return this.unsavedDataPrompt.confirm();
  }

}
