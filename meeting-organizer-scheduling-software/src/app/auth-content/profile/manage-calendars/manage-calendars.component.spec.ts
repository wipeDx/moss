import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCalendarsComponent } from './manage-calendars.component';

describe('ManageCalendarsComponent', () => {
  let component: ManageCalendarsComponent;
  let fixture: ComponentFixture<ManageCalendarsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageCalendarsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageCalendarsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
