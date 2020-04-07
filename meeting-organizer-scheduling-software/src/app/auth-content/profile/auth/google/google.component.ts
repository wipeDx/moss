import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GoogleService } from 'src/app/services/calendars/google/google.service';
import { AuthService } from 'src/app/auth/auth.service';
import { AlertService } from 'src/app/services/alert/alert.service';
import { Calendar } from 'src/app/models/calendar';
import { UserService } from 'src/app/services/user/user.service';


@Component({
  selector: 'app-google',
  templateUrl: './google.component.html',
  styleUrls: ['./google.component.css']
})
export class GoogleComponent implements OnInit {

  loading: boolean;
  @Input() existingCalendars: Calendar[];

  constructor(
    private route: ActivatedRoute,
    private googleService: GoogleService,
    private router: Router,
    private authService: AuthService,
    private alertService: AlertService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.loading = true;
    this.completeAuthentication();
  }

  completeAuthentication() {
    this.googleService.getOAuthToken(this.grabAPICode()).subscribe(
      data => {
        this.authService.updateCurrentUser();
        this.userService.getAllCalendars().subscribe(calendars => this.existingCalendars = calendars);
        this.loading = false;
        this.alertService.success("Calendar successfully added", true);
        this.router.navigateByUrl('/profile');
      },
      err => {
        this.loading = false;
        this.alertService.error('Error while adding calendar', true);
        this.router.navigateByUrl('/profile');
      }
    );
  }

  grabAPICode() {
    return this.route.snapshot.queryParamMap.get('code');
  }

  grabAPIScope() {
    console.log(this.route.snapshot.queryParamMap.get('scope'));
  }

}
