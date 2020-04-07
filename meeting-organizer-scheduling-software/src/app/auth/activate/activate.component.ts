import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert/alert.service';
import { AuthService } from '../auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-activate',
  templateUrl: './activate.component.html',
  styleUrls: ['./activate.component.css']
})
export class ActivateComponent implements OnInit {

  constructor(
    private alertService: AlertService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private Router: Router
  ) { }

  ngOnInit() {
    const email = this.route.snapshot.queryParamMap.get('email');
    const token = this.route.snapshot.queryParamMap.get('token');
    console.log(email);
    console.log(token);
    this.authService.activateAccount(email, token).subscribe(
      data => {
        this.alertService.success('Account successfully activated', true);
        this.Router.navigate(['/login']);
      },
      error => {
        this.alertService.error(`Could not activate your account`, true);
        this.Router.navigate(['/login']);
      }
    )
  }

}
