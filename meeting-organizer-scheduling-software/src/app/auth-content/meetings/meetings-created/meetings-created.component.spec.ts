import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingsCreatedComponent } from './meetings-created.component';

describe('MeetingsCreatedComponent', () => {
  let component: MeetingsCreatedComponent;
  let fixture: ComponentFixture<MeetingsCreatedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeetingsCreatedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeetingsCreatedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
