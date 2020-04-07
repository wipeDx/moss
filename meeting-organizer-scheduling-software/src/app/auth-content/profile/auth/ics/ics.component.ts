import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IcsService } from 'src/app/services/calendars/ics/ics.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertService } from 'src/app/services/alert/alert.service';
declare var $: any;

@Component({
  selector: 'app-ics',
  templateUrl: './ics.component.html',
  styleUrls: ['./ics.component.css']
})

export class IcsComponent implements OnInit {

  icsForm: FormGroup;
  loading: boolean;
  errorFeed;
  errorName;

  constructor(
    private router: Router,
    private icsService: IcsService,
    private formBuilder: FormBuilder,
    private alertService: AlertService
  ) {}

  ngOnInit() {  
    this.loading = false;
    $('#icsInputModal').modal('show');
    this.icsForm = this.formBuilder.group({
      feed: ['', Validators.required],
      name: ['', Validators.required]
    })
  }

  onCancel() {
    this.router.navigateByUrl('/profile');
  }

  // convenience getter for form fields
  get f() { return this.icsForm.controls; }

  onSubmit() {
    this.loading = true;
    this.errorFeed = this.icsForm.controls.feed.errors;
    this.errorName = this.icsForm.controls.name.errors;

    console.log("submitted");
    // Stop if form is invalid
    if (this.icsForm.invalid) {
      console.log('its invalid');
      console.log(this.errorFeed)
      return;
    }

    this.icsService.addICSFeed(this.f.feed.value, this.f.name.value).subscribe(
      data => {
        this.alertService.success('Successfully added ICS Calendar feed', true);
        $('#icsInputModal').modal('hide');
        this.router.navigateByUrl('/profile');
      },
      error => console.error(error)
    );
  }

  

}
