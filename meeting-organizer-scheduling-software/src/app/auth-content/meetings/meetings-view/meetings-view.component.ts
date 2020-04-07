import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MeetingsService } from 'src/app/services/meetings/meetings.service';
import { AuthService } from 'src/app/auth/auth.service';
import { Meeting, EmptyMeeting, Interval } from 'src/app/models/meeting';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/services/alert/alert.service';
import { MeetingsViewCalendarComponent } from './meetings-view-calendar/meetings-view-calendar.component';
import { AnswerState } from 'src/app/models/attendee';
import { friendlyIntervalFunction } from 'src/app/models/meeting';
import { User } from 'src/app/models/user';
import { faUserFriends, faCalendarCheck, faCalendarTimes, faCaretSquareUp, faCaretSquareDown } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-meetings-view',
  templateUrl: './meetings-view.component.html',
  styleUrls: ['./meetings-view.component.css']
})
export class MeetingsViewComponent implements OnInit {

  @ViewChild(MeetingsViewCalendarComponent, {static: false}) calendar: MeetingsViewCalendarComponent; 

  iconDetailsHide = faCaretSquareUp;
  iconDetailsShow = faCaretSquareDown;
  iconInvitees = faUserFriends;
  iconAccept = faCalendarCheck;
  iconDecline = faCalendarTimes;

  viewedMeeting: Meeting;
  loading: boolean;
  timesChanged: boolean;
  hidingDetails: boolean;
  validRange: any;
  customAnswer: string;
  isAccepted: boolean;
  isDeclined: boolean;
  customAnswerChanged: boolean;
  currentUser: User;
  ownsMeeting;

  constructor(
    private meetingService: MeetingsService,
    private authService: AuthService,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.viewedMeeting = EmptyMeeting;
    this.currentUser = authService.currentUserValue;
  }

  ngOnInit() {
    this.loading = true;
    this.timesChanged = false;
    this.customAnswerChanged = false;
    this.hidingDetails = false;
    this.customAnswer = '';
    this.ownsMeeting = false;
    this.meetingService.getMeeting(this.route.snapshot.url[this.route.snapshot.url.length - 1].toString()).subscribe(
      meeting => {
        this.viewedMeeting = meeting;
        meeting.attendees.forEach(attendee => {
          if (attendee.userID._id.toString() === this.authService.currentUserValue._id) {
            this.isAccepted = attendee.answerState == AnswerState.YES;
            this.isDeclined = attendee.answerState == AnswerState.NO;
            console.log(this.isAccepted);
            console.log(this.isDeclined);
            if (this.isAccepted || this.isDeclined) {
              this.customAnswer = attendee.customAnswer;
            }
          }
        
        })
        this.ownsMeeting = this.viewedMeeting.creator._id.toString() === this.currentUser._id;

        this.loading = false;
        this.calculateValidRange()
        setTimeout(()=> {
          this.calendar.recalculateAspectRatio();
        }, 150);
      },
      error => {
        this.alertService.error("Error while loading Meeting", true);
        this.router.navigateByUrl('/meetings');
      }
    )
    
  }

  /**
   * Simple proxy function that calls another function
   * @param interval Interval to translate
   * @param multiple Whether its multiple or not
   */
  friendlyInterval(interval: Interval, multiple: boolean): string {
    return friendlyIntervalFunction(interval, multiple);
  }

  setCustomAnswerChanged() {
    this.customAnswerChanged = true;
  }

  onDecline() {
    this.meetingService.declineMeeting(this.viewedMeeting, this.customAnswer).subscribe(
      data  => {
        this.alertService.success("Successfully declined meeting");
        this.isDeclined = true;
        this.isAccepted = false;
      },
      error => this.alertService.error("Error while declining meeting")
    );
  }

  onUpdateAccept() {
    this.customAnswerChanged = false;
    this.onAccept();
  }
  onUpdateDecline() {
    this.customAnswerChanged = false;
    this.onDecline();
  }

  onAccept() {
    this.meetingService.acceptMeeting(this.viewedMeeting, this.customAnswer).subscribe(
      data  => {
        this.alertService.success("Successfully accepted meeting");
        this.isDeclined = false;
        this.isAccepted = true;
      },
      error => this.alertService.error("Error while accepting meeting")
    );
  }

  toggleDetails() {
    this.hidingDetails = !this.hidingDetails;
    setTimeout(()=> {
      this.calendar.recalculateAspectRatio();
    }, 0);
  }

  calculateValidRange() {
    var earliestStart = this.viewedMeeting.timeslots[0].start;
    var latestEnd = this.viewedMeeting.timeslots[0].end;
    this.viewedMeeting.timeslots.forEach(slot => {
      if (slot.start < earliestStart) {
        earliestStart = slot.start;
      }
      if (slot.end > latestEnd) {
        latestEnd = slot.end;
      }
    })
    this.validRange = {
      start: earliestStart,
      end: latestEnd
    }
  }
}
