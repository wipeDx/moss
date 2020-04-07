import { Component, OnInit } from '@angular/core';
import { AppleService } from 'src/app/services/calendars/apple/apple.service';
import { AuthService } from 'src/app/auth/auth.service';
import { AlertService } from 'src/app/services/alert/alert.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-apple',
  templateUrl: './apple.component.html',
  styleUrls: ['./apple.component.css']
})
export class AppleComponent implements OnInit {

  loading: boolean;

  constructor(
    private appleService: AppleService,
    private authService: AuthService,
    private alertService: AlertService
    ) { }

  ngOnInit() {
    this.loading = false;
  }
}
