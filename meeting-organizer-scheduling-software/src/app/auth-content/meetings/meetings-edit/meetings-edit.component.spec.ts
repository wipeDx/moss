import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingsEditComponent } from './meetings-edit.component';

describe('MeetingsEditComponent', () => {
  let component: MeetingsEditComponent;
  let fixture: ComponentFixture<MeetingsEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeetingsEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeetingsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
