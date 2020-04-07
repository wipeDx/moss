import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MicrosoftService } from 'src/app/services/calendars/microsoft/microsoft.service';
import { AuthService } from 'src/app/auth/auth.service';
import { AlertService } from 'src/app/services/alert/alert.service';
import { Calendar } from 'src/app/models/calendar';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-microsoft',
  templateUrl: './microsoft.component.html',
  styleUrls: ['./microsoft.component.css']
})
export class MicrosoftComponent implements OnInit {

  loading: boolean;
  @Input() existingCalendars: Calendar[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private microsoftService: MicrosoftService,
    private authService: AuthService,
    private alertService: AlertService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.loading = true;
    this.microsoftService.getInitialAccessToken(this.route.snapshot.queryParamMap.get('code')).subscribe(
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

  // parseURL() {
  //   let splitURL = window.location.href.split('#');
  //   let splitParams = splitURL[1].split('&');
  //   console.log(splitParams);
  //   let result = {
  //     access_token: splitParams[0].split('=')[1],
  //     token_type: splitParams[1].split('=')[1],
  //     expires_in: splitParams[2].split('=')[1],
  //     scope: splitParams[3].split('=')[1],
  //     client_info: splitParams[4].split('=')[1],
  //     state: splitParams[5].split('=')[1],
  //   }
  //   return result;
  // }

  // async completeAuthentication() {
  //   (await this.microsoftService.getAccessToken()).subscribe(
  //     async data => {
  //       this.router.navigateByUrl('/profile');
  //     }
  //   );
  // }

}
