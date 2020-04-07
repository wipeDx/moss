import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StepCalendarComponent } from './step-calendar.component';

describe('StepCalendarComponent', () => {
  let component: StepCalendarComponent;
  let fixture: ComponentFixture<StepCalendarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StepCalendarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
