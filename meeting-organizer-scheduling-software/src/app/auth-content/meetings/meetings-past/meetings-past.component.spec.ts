import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingsPastComponent } from './meetings-past.component';

describe('MeetingsPastComponent', () => {
  let component: MeetingsPastComponent;
  let fixture: ComponentFixture<MeetingsPastComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeetingsPastComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeetingsPastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
