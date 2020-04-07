import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalSetMeetingComponent } from './modal-set-meeting.component';

describe('ModalSetMeetingComponent', () => {
  let component: ModalSetMeetingComponent;
  let fixture: ComponentFixture<ModalSetMeetingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalSetMeetingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalSetMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
