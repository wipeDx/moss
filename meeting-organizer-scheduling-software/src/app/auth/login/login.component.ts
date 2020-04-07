import { Component, OnInit } from '@angular/core';
import { SHA3 } from 'sha3';
import { User } from 'src/app/models/user';
import { AuthService } from '../auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertService } from 'src/app/services/alert/alert.service';
import { first } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { HashService } from 'src/app/services/hash/hash.service';
declare var $: any;


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
 
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  otpToken: string;

  errorPassword;
  errorEmail;
  errorOtpToken;
  tokenDidNotMatch: boolean;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    public translate: TranslateService,
    private hash: HashService
  ) { 
      // user is already logged in, redirect
      if (this.authService.currentUserValue) {
        this.router.navigate(['/dashboard']);
      }
      
  }

  ngOnInit() {
    this.tokenDidNotMatch = false;
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
      rememberme: [''],
      otpToken: ['', Validators.compose([Validators.minLength(6), Validators.maxLength(6)])]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    console.log(this.translate.currentLang);
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
  }

  // convenience getter for form fields
  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.errorEmail = this.loginForm.controls.email.errors;
    this.errorPassword = this.loginForm.controls.password.errors;
    this.f.otpToken.setValue(this.otpToken);
    this.errorOtpToken = this.loginForm.controls.otpToken.errors;
    this.submitted = true;

    // Stop if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    this.authService.login(
      this.f.email.value,
      this.hash.hashPassword(this.f.password.value),
      this.f.rememberme.value,
      this.f.otpToken.value)
      .pipe(first())
      .subscribe(
        data => {
          this.alertService.success('Successfully logged in', true);
          $('#modal2FALogin').modal('hide');
          this.tokenDidNotMatch = false;
          this.router.navigate([this.returnUrl])
        },
        error => {
          this.loading = false;
          if (error === "2FA needed") {
            this.otpToken = "";
            $('#modal2FALogin').modal('show');
          }
          else if (error === "Invalid 2FA token") {
            this.tokenDidNotMatch = true;
          }
          this.alertService.error(error);
        }
      );
  }

}
