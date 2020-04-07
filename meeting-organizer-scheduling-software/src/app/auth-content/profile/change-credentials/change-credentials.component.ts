import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidationErrors } from '@angular/forms';
import { AuthService } from 'src/app/auth/auth.service';
import { UserService } from 'src/app/services/user/user.service';
import { User, UserCredentials } from 'src/app/models/user';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { HashService } from 'src/app/services/hash/hash.service';
import { AlertService } from 'src/app/services/alert/alert.service';
import { TwoFactorEnableComponent } from '../../modals/two-factor-enable/two-factor-enable.component';
import { TwoFactorDisableComponent } from '../../modals/two-factor-disable/two-factor-disable.component';
declare var $: any;

@Component({
  selector: 'app-change-credentials',
  templateUrl: './change-credentials.component.html',
  styleUrls: ['./change-credentials.component.css']
})
export class ChangeCredentialsComponent implements OnInit {

  @ViewChild(TwoFactorEnableComponent, {static: false}) modal2FAEnable: TwoFactorEnableComponent;
  @ViewChild(TwoFactorDisableComponent, {static: false}) modal2FADisable: TwoFactorDisableComponent;

  iconSave = faSave;
  profileCredentials: FormGroup;
  currentUser: User;

  errorName: ValidationErrors;
  errorEmail: ValidationErrors;
  errorPassword: ValidationErrors;
  errorPasswordAgain: ValidationErrors;
  errorPasswordMatch: boolean;
  submitted: boolean;
  twoFAEnabled: string;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private alertService: AlertService,
    private hash: HashService) {
    this.currentUser = authService.currentUserValue;
    this.twoFAEnabled = this.currentUser.uses2FA ? 'enabled' : 'disabled';
   }

  ngOnInit() {
    this.profileCredentials = this.formBuilder.group({
      name: [''],
      email: [{value: '', disabled: true}, Validators.email],
      password: ['', Validators.minLength(8)],
      passwordAgain: ['', Validators.minLength(8)]
    });
  }

  // convenience getter for form fields
  get f() { return this.profileCredentials.controls; }

  onSubmit() {
    this.submitted = true;
    this.errorName = this.f.name.errors;
    this.errorEmail = this.f.email.errors;
    this.errorPassword = this.f.password.errors;
    this.errorPasswordAgain = this.f.passwordAgain.errors;
    if (this.f.password && this.f.passwordAgain) {
      this.errorPasswordMatch = this.f.password.value != this.f.passwordAgain.value;
    }
    
    if (this.profileCredentials.invalid || this.errorPasswordMatch) {
      console.log(this.f);
      return;
    }

    var userCredentials: UserCredentials = {
      _id: this.authService.currentUserValue._id
    }
    if (this.f.name.value.length > 0) {
      userCredentials.name = this.f.name.value;
    }
    // if (this.f.email.value.length > 0) {
    //   userCredentials.name = this.f.name.value;
    // }
    if (this.f.password.value.length > 0) {
      userCredentials.password = this.hash.hashPassword(this.f.password.value);
    }

    // If at least one of them are defined
    if (userCredentials.name || userCredentials.password || userCredentials.email) {
      console.log(userCredentials);
      this.userService.changeUserData(userCredentials).subscribe(
        data => this.alertService.success("Successfully changed credentials. Changes might need a relog to appear."),
        err => console.log(err)
      );
    }
  }

  openEnable2FA() {
    this.modal2FAEnable.loadValues();
    $('#modal2FAEnable').modal('show');
  }

  openDisable2FA() {
    $('#modal2FADisable').modal('show');
  }
}
