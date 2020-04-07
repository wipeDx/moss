import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthedRoutingModule } from './authed-routing.module';
import { AuthContentComponent } from './auth-content.component';
import { NavigationComponent } from './navigation/navigation.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { GroupEditComponent } from './groups-list/group-edit/group-edit.component';
import { GroupCreateComponent } from './groups-list/group-create/group-create.component';
import { MeetingsCurrentComponent } from './meetings/meetings-current/meetings-current.component';
import { MeetingsComponent } from './meetings/meetings.component';
import { MeetingsPastComponent } from './meetings/meetings-past/meetings-past.component';
import { MeetingsListComponent } from './meetings/meetings-list/meetings-list.component';
import { MeetingsCreatedComponent } from './meetings/meetings-created/meetings-created.component';
import { MeetingsCreateComponent } from './meetings/meetings-create/meetings-create.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarComponent } from './calendar/calendar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StepCalendarComponent } from './meetings/meetings-create/step-calendar/step-calendar.component';
import { StepDetailsComponent } from './meetings/meetings-create/step-details/step-details.component';
import { GoogleComponent } from './profile/auth/google/google.component';
import { MicrosoftComponent } from './profile/auth/microsoft/microsoft.component';
import { TranslateModule } from '@ngx-translate/core';
import { FullPageLoadingSpinnerComponent } from '../full-page-loading-spinner/full-page-loading-spinner.component';
import { MeetingsViewComponent } from './meetings/meetings-view/meetings-view.component';
import { MeetingsEditComponent } from './meetings/meetings-edit/meetings-edit.component';
import { IcsComponent } from './profile/auth/ics/ics.component';
import { MeetingsViewCalendarComponent } from './meetings/meetings-view/meetings-view-calendar/meetings-view-calendar.component';
import { ChangeCredentialsComponent } from './profile/change-credentials/change-credentials.component';
import { ModalTimeslotEditComponent } from './meetings/modal-timeslot-edit/modal-timeslot-edit.component';
import { AppleComponent } from './profile/auth/apple/apple.component';
import { ManageCalendarsComponent } from './profile/manage-calendars/manage-calendars.component';
import { DangerZoneComponent } from './profile/danger-zone/danger-zone.component';
import { ModalSetMeetingComponent } from './modals/modal-set-meeting/modal-set-meeting.component';
import { ModalCancelMeetingComponent } from './modals/modal-cancel-meeting/modal-cancel-meeting.component';
import { TwoFactorEnableComponent } from './modals/two-factor-enable/two-factor-enable.component';
import { TwoFactorDisableComponent } from './modals/two-factor-disable/two-factor-disable.component';
import { ModalMeetingCreationAutomaticSelectionComponent } from './modals/modal-meeting-creation-automatic-selection/modal-meeting-creation-automatic-selection.component';


@NgModule({
  declarations: [
    AuthContentComponent,
    NavigationComponent,
    GroupEditComponent,
    GroupCreateComponent,
    MeetingsCurrentComponent,
    MeetingsPastComponent,
    MeetingsListComponent,
    MeetingsCreatedComponent,
    MeetingsCreateComponent,
    CalendarComponent,
    StepCalendarComponent,
    StepDetailsComponent,
    GoogleComponent,
    MicrosoftComponent,
    FullPageLoadingSpinnerComponent,
    MeetingsViewComponent,
    MeetingsEditComponent,
    IcsComponent,
    MeetingsViewCalendarComponent,
    ChangeCredentialsComponent,
    ModalTimeslotEditComponent,
    AppleComponent,
    ManageCalendarsComponent,
    DangerZoneComponent,
    ModalSetMeetingComponent,
    ModalCancelMeetingComponent,
    TwoFactorEnableComponent,
    TwoFactorDisableComponent,
    ModalMeetingCreationAutomaticSelectionComponent
    ],
  imports: [
    CommonModule,
    AuthedRoutingModule,
    FontAwesomeModule,
    FullCalendarModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  exports: [MeetingsListComponent]
})
export class AuthedModule { }
