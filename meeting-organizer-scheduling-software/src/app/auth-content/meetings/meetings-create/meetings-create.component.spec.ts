import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingsCreateComponent } from './meetings-create.component';

describe('MeetingsCreateComponent', () => {
  let component: MeetingsCreateComponent;
  let fixture: ComponentFixture<MeetingsCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeetingsCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeetingsCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
