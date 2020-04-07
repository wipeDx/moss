import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MeetingsService } from 'src/app/services/meetings/meetings.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Timeslot } from 'src/app/models/timeslot';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { HashService } from 'src/app/services/hash/hash.service';
import { faTimes, faCalendarAlt, faCalendarCheck } from '@fortawesome/free-solid-svg-icons';
declare var $: any;

@Component({
  selector: 'app-modal-meeting-creation-automatic-selection',
  templateUrl: './modal-meeting-creation-automatic-selection.component.html',
  styleUrls: ['./modal-meeting-creation-automatic-selection.component.css']
})
export class ModalMeetingCreationAutomaticSelectionComponent implements OnInit {

  buttonCalculate = faCalendarAlt;
  buttonConfirm = faCalendarCheck;
  buttonCancel = faTimes;

  selectedStartDate: number;
  formGroup: FormGroup;
  loadedProposedTimes: boolean;
  gottenResults: boolean;
  proposedDates: any;
  selectedDates: any;
  loading: boolean;

  @Input() calendarEvents: Timeslot[];
  @Input() selectedTimeslots: Map<string, Timeslot>;


  constructor(
    private meetingService: MeetingsService,
    private formBuilder: FormBuilder,
    private hashService: HashService
    ) { }

  ngOnInit() {
    this.selectedStartDate = Date.now();
    this.formGroup = this.formBuilder.group({
      numAppointments: [1, Validators.required],
      startDate: [this.getDateString(), Validators.required],
      endDate: [this.getDateString(60), Validators.required],
      timeRangeStart: ['08:00', Validators.required],
      timeRangeEnd: ['18:00', Validators.required],
      lenAppointmentsHours: ['0', Validators.required],
      lenAppointmentsMinutes: ['30', Validators.required],
      specificDayMon: [true],
      specificDayTue: [true],
      specificDayWed: [true],
      specificDayThu: [true],
      specificDayFri: [true],
      specificDaySat: [false],
      specificDaySun: [false]
    });
    this.gottenResults = false;
    this.loading = false;
  }

  // convenience getter for form fields
  get f() { return this.formGroup.controls; }

  onSubmit() {
    this.loading = true;
    
    
    if (this.formGroup.invalid) {
      return;
    }

    let settings = {
      numAppointments: this.f.numAppointments.value,
      startDate: this.f.startDate.value,
      endDate: this.f.endDate.value,
      timeRangeStart: this.f.timeRangeStart.value,
      timeRangeEnd: this.f.timeRangeEnd.value,
      appointmentLength: [this.f.lenAppointmentsHours.value, this.f.lenAppointmentsMinutes.value],
      days: [
        this.f.specificDaySun.value,   // Date.getDate() goes from 0 - 6 and starts with sunday, hence sunday is first here
        this.f.specificDayMon.value,
        this.f.specificDayTue.value,
        this.f.specificDayWed.value,
        this.f.specificDayThu.value,
        this.f.specificDayFri.value,
        this.f.specificDaySat.value
      ]
    }
    this.meetingService.findMeetingTimeslots(settings, this.meetingService.getAttendeeIDsOfMeeting()).subscribe(
      data => {
        this.loading = false;
        this.gottenResults = true;
        this.proposedDates = this.convertDates(settings.numAppointments, data);
      },
      error => {
        this.loading = false;
        console.error(error)
      }
    );
  }

  convertDates(num: number, data: any) {
    let returny = [];
    let tempArray = [];

    for (let i = 0; i < data.length; ++i) {
      tempArray.push(data[i]);
      if ((i+1) % num === 0) {
        returny.push(tempArray);
        tempArray = [];
      }
    }
    return returny;
  }
  
  changeSelection(value: any) {
    this.selectedDates = value;
  }

  onConfirm() {
    for (let i = 0; i < this.selectedDates.length; ++i) {
      const selectedDate = this.selectedDates[i];
      const startDate = new Date(selectedDate.start);
      const endDate = new Date(selectedDate.end);
      startDate.setSeconds(0);
      startDate.setMilliseconds(0);
      endDate.setSeconds(0);
      endDate.setMilliseconds(0);
      var ts: Timeslot = {
        title: "Selected Timeslot",
        start: startDate,
        end: endDate,
        extendedProps: { 
          hashID: this.hashService.hashPassword(Date.now().toString())
        }
      };
      this.calendarEvents.push(ts);
      this.selectedTimeslots.set(ts.extendedProps.hashID, ts);
    }
    $('#modalAutomaticSelection').modal('hide');
  }

  displayDate(date) {
    const currentDate = new Date(date);
    const options = { weekday: 'short', year: '2-digit', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return currentDate.toLocaleDateString(undefined, options);
  }

  /**
   * Returns a datestring in the form that browsers can make use of it. Optional offset possible
   * @param dayOffset Offset of days
   */
  getDateString(dayOffset: number = 0) {
    const currentDate = new Date(Date.now() + dayOffset * 86400000);
    return currentDate.toISOString().substring(0,10);
  }

}
