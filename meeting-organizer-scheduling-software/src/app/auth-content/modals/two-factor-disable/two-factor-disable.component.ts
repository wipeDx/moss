import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TwoFAService } from 'src/app/services/TwoFA/two-fa.service';
import { AlertService } from 'src/app/services/alert/alert.service';
import { AuthService } from 'src/app/auth/auth.service';
import { Router } from '@angular/router';
import { faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';
declare var $: any;

@Component({
  selector: 'app-two-factor-disable',
  templateUrl: './two-factor-disable.component.html',
  styleUrls: ['./two-factor-disable.component.css']
})
export class TwoFactorDisableComponent implements OnInit {

  submitted: boolean;
  tokenDidNotMatch: boolean;
  verificationForm: FormGroup;
  errorToken;

  iconCancel = faTimes;
  iconDisable = faTrash;

  constructor(
    private twoFA: TwoFAService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router) {
      this.verificationForm = formBuilder.group({
        token: ['', Validators.compose([Validators.required, Validators.maxLength(6), Validators.minLength(6)])]
      });
    }

  ngOnInit() {
    this.submitted = false;
    this.tokenDidNotMatch = false;
  }

  verifyToken() {
    this.submitted = true;
    this.errorToken = this.verificationForm.controls.token.errors;
    // Stop if form is invalid
    if (this.verificationForm.invalid) {
      return;
    }
    this.twoFA.removeToken(this.verificationForm.controls.token.value).subscribe(
      data => {
        this.tokenDidNotMatch = false;
        this.alertService.success('Successfully removed Two-Factor Authentication from your account', true);
        this.submitted = false;
        $('#modal2FADisable').modal('hide');
        this.authService.updateCurrentUser();
        this.router.navigateByUrl('/profile');
      },
      error => {
        if (error === "Token did not match secret") {
          this.tokenDidNotMatch = true;
        }
        else {
          console.error(error);
        }
      }
    )
  }
}
