import { Component, OnInit, ElementRef, Input } from '@angular/core';
import { TwoFAService } from 'src/app/services/TwoFA/two-fa.service';
import { AlertService } from 'src/app/services/alert/alert.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from 'src/app/auth/auth.service';
import { Router } from '@angular/router';
import { faPaste, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
declare var $: any;

@Component({
  selector: 'app-two-factor-enable',
  templateUrl: './two-factor-enable.component.html',
  styleUrls: ['./two-factor-enable.component.css']
})
export class TwoFactorEnableComponent implements OnInit {

  copyToClipboardButton = faPaste
  qrURI: string;
  secret: string;
  loading: boolean;
  submitted: boolean;
  tokenDidNotMatch: boolean;
  verificationForm: FormGroup;
  errorToken;

  iconVerify = faPlus;
  iconCancel = faTimes;

  constructor
  ( private twoFA: TwoFAService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router ) 
  {
    this.verificationForm = formBuilder.group({
      token: ['', Validators.compose([Validators.required, Validators.maxLength(6), Validators.minLength(6)])]
    });
  }

  // https://stackoverflow.com/a/57063251
  copyToClipboard(): void {
    let listener = (e: ClipboardEvent) => {
        e.clipboardData.setData('text/plain', (this.secret));
        e.preventDefault();
    };

    document.addEventListener('copy', listener);
    document.execCommand('copy');
    document.removeEventListener('copy', listener);
  }

  ngOnInit() {
    this.loading = false;
    this.submitted = false;
    this.tokenDidNotMatch = false;
  }

  loadValues() {
    this.loading = true;
    this.twoFA.getSecret().subscribe(
      response => {
        this.qrURI = response.qrURI;
        this.secret = response.secret;
        this.loading = false;
      },
      error => console.error(error)
    );
  }

  verifyToken() {
    this.submitted = true;
    this.errorToken = this.verificationForm.controls.token.errors;
    // Stop if form is invalid
    if (this.verificationForm.invalid) {
      return;
    }
    this.twoFA.verifyToken(this.verificationForm.controls.token.value, true).subscribe(
      data => {
        this.tokenDidNotMatch = false;
        this.alertService.success('Successfully added Two-Factor Authentication to your account', true);
        this.submitted = false;
        $('#modal2FAEnable').modal('hide');
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
