import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingsViewCalendarComponent } from './meetings-view-calendar.component';

describe('MeetingsViewCalendarComponent', () => {
  let component: MeetingsViewCalendarComponent;
  let fixture: ComponentFixture<MeetingsViewCalendarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeetingsViewCalendarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeetingsViewCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
