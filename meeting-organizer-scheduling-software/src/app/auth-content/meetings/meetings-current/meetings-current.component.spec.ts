import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingsCurrentComponent } from './meetings-current.component';

describe('MeetingsCurrentComponent', () => {
  let component: MeetingsCurrentComponent;
  let fixture: ComponentFixture<MeetingsCurrentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeetingsCurrentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeetingsCurrentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
