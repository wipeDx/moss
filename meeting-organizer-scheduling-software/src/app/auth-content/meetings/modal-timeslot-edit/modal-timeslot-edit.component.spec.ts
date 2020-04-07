import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalTimeslotEditComponent } from './modal-timeslot-edit.component';

describe('ModalTimeslotEditComponent', () => {
  let component: ModalTimeslotEditComponent;
  let fixture: ComponentFixture<ModalTimeslotEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalTimeslotEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalTimeslotEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
