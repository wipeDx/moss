import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalMeetingCreationAutomaticSelectionComponent } from './modal-meeting-creation-automatic-selection.component';

describe('ModalMeetingCreationAutomaticSelectionComponent', () => {
  let component: ModalMeetingCreationAutomaticSelectionComponent;
  let fixture: ComponentFixture<ModalMeetingCreationAutomaticSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalMeetingCreationAutomaticSelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalMeetingCreationAutomaticSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
