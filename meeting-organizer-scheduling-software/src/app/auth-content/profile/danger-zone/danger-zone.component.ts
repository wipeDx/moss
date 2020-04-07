import { Component, OnInit } from '@angular/core';
import { faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FormGroup, FormBuilder, Validators, ValidationErrors } from '@angular/forms';
import { HashService } from 'src/app/services/hash/hash.service';
import { AuthService } from 'src/app/auth/auth.service';
import { UserService } from 'src/app/services/user/user.service';
import { AlertService } from 'src/app/services/alert/alert.service';

@Component({
  selector: 'app-danger-zone',
  templateUrl: './danger-zone.component.html',
  styleUrls: ['./danger-zone.component.css']
})
export class DangerZoneComponent implements OnInit {

  iconDelete = faTrash;
  iconCancel = faTimes;

  submitted: boolean;
  deleteAccountForm: FormGroup;
  errorPassword: ValidationErrors;

  constructor(
    private formBuilder: FormBuilder,
    private hash: HashService,
    private authService: AuthService,
    private userService: UserService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.submitted = false;
    this.deleteAccountForm = this.formBuilder.group({
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    this.submitted = true;
    this.errorPassword = this.deleteAccountForm.controls.password.errors;
    if (this.deleteAccountForm.invalid) {
      return;
    }
  }

}
