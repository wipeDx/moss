import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/services/alert/alert.service';
import { UserService } from 'src/app/services/user/user.service';
import { first } from 'rxjs/operators';
import { SHA3 } from 'sha3';
import { HashService } from 'src/app/services/hash/hash.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  registerForm: FormGroup;

  invalidName;
  invalidPassword;
  invalidEmail;
  invalidTerms;

  loading = false;
  submitted = false;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private alertService: AlertService,
    private userService: UserService,
    private hash: HashService
  ) 
  {
    // redirect to dashboard if user already logged in
    if (this.authService.currentUserValue) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
        name: ['', Validators.required],
        password: ['', Validators.compose([Validators.required, Validators.minLength(8)])],
        email: ['', Validators.compose([Validators.required, Validators.email])],
        terms: ['', Validators.requiredTrue]
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.registerForm.controls; }

  onSubmit() {
    this.invalidEmail = this.f.email.errors;
    this.invalidName = this.f.name.errors;
    this.invalidPassword = this.f.password.errors;
    this.invalidTerms = this.f.terms.errors;
    
    this.submitted = true;

    // reset alertservice
    this.alertService.clear();

    // stop if form invalid
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;

    var hashedUser = this.registerForm.value;
    hashedUser.password = this.hash.hashPassword(hashedUser.password);

    this.userService.register(hashedUser)
        .pipe(first())
        .subscribe(
          data => {
            this.alertService.success('Registration successful', true);
            this.router.navigate(['/login']);
          },
          error => {
            this.alertService.error('Error during registration');
            this.loading = false;
          }
        );
  }

}
