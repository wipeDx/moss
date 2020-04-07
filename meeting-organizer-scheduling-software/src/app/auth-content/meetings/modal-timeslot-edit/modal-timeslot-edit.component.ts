import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Timeslot, EmptyTimeslot } from 'src/app/models/timeslot';
import { faTrash, faTimes, faSave } from '@fortawesome/free-solid-svg-icons';
declare var $: any;

@Component({
  selector: 'app-modal-timeslot-edit',
  templateUrl: './modal-timeslot-edit.component.html',
  styleUrls: ['./modal-timeslot-edit.component.css']
})
export class ModalTimeslotEditComponent implements OnInit {

  @Input() events: Map<string, Timeslot>;
  @Input() readOnly: boolean;
  @Output() deleteFromCalendarEvents = new EventEmitter<string>();
  @Output() changeCalendarEvent = new EventEmitter<any>();
  eventToEdit: Timeslot;

  iconDelete = faTrash;
  iconCancel = faTimes;
  iconSave = faSave;

  @ViewChild('eventTitle', {static: true}) eventTitle: ElementRef;
  @ViewChild('eventDateStart', {static: true}) eventStartDate: ElementRef;
  @ViewChild('eventTimeStart', {static: true}) eventStartTime: ElementRef;
  @ViewChild('eventDateEnd', {static: true}) eventEndDate: ElementRef;
  @ViewChild('eventTimeEnd', {static: true}) eventEndTime: ElementRef;

  constructor() { }

  ngOnInit() {
    this.eventToEdit = EmptyTimeslot;
  }

  setEventToEdit(event: Timeslot) {
    this.eventToEdit = event;
  }

  getLocalDate(toBeConvertedDate: Date) {
    return toBeConvertedDate.toISOString().substring(0,10);
  }
  /**
   * Adds local offset to getTime() method of a Date
   * There's 60.000 milliseconds in a minute
   * @param toBeConvertedDate Date you want to convert
   */
  getLocalNumericTime(toBeConvertedDate: Date) {
    return toBeConvertedDate.getTime() - new Date(Date.now()).getTimezoneOffset() * 60000;
  }

  saveEvent() {
    let newTitle = this.eventToEdit.title;
    let newStart = this.eventToEdit.start;
    let newEnd = this.eventToEdit.end;
    if (!this.eventToEdit.title) {
      newTitle = "Timeslot";
    }
    else {
      newTitle = this.eventTitle.nativeElement.value;
    }
    
    newStart = new Date(this.eventStartDate.nativeElement.value);
    newEnd = new Date(this.eventEndDate.nativeElement.value);
    const splitTimeStart = this.eventStartTime.nativeElement.value.split(':');
    newStart.setHours(splitTimeStart[0]);
    newStart.setMinutes(splitTimeStart[1]);
    const splitTimeEnd = this.eventEndTime.nativeElement.value.split(':');
    newEnd.setHours(splitTimeEnd[0]);
    newEnd.setMinutes(splitTimeEnd[1]);

    this.changeCalendarEvent.emit({
      newStart: newStart,
      newEnd: newEnd,
      newTitle: newTitle,
      eventHashID: this.eventToEdit.extendedProps.hashID
    });
    console.log(newStart);
    console.log(newEnd);
    this.closeModal();
  }

  // Simply opens the modal
  openModal() {
    if (this.eventToEdit === undefined) {
      return;
    }
    console.log(this.eventToEdit.start.getDate());
    $('#timeslotEdit').modal('show');
  }

  // Closes the modal
  closeModal() {
    $('#timeslotEdit').modal('hide');
  }

  

  deleteEvent() {
    this.events.delete(this.eventToEdit.extendedProps.hashID);
    this.deleteFromCalendarEvents.emit(this.eventToEdit.extendedProps.hashID);
    this.eventToEdit = EmptyTimeslot;
    this.closeModal();
  }


}
