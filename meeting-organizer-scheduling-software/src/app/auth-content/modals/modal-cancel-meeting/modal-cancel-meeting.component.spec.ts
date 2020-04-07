import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCancelMeetingComponent } from './modal-cancel-meeting.component';

describe('ModalCancelMeetingComponent', () => {
  let component: ModalCancelMeetingComponent;
  let fixture: ComponentFixture<ModalCancelMeetingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalCancelMeetingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalCancelMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
