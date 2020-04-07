import { Component, OnInit } from '@angular/core';
import { faUser, faSignOutAlt, faColumns, faCalendar, faUserFriends, faPlus } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/models/user';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {

  iconDash = faColumns;
  iconUser = faUser;
  iconMeetings = faCalendar;
  iconGroups = faUserFriends;
  iconLogout = faSignOutAlt;
  iconPlus = faPlus;

  currentUser: User;

  constructor(
    private authService: AuthService,
    public translate: TranslateService) {
    this.currentUser = authService.currentUserValue;
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
  }

  ngOnInit() {

  }

}
