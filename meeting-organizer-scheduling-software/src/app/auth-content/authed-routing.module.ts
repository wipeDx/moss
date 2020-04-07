import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { GroupsListComponent } from './groups-list/groups-list.component';
import { MeetingsComponent } from './meetings/meetings.component';
import { ProfileComponent } from './profile/profile.component';
import { AuthContentComponent } from './auth-content.component';
import { AuthGuard } from '../auth/auth.guard';
import { GroupEditComponent } from './groups-list/group-edit/group-edit.component';
import { GroupCreateComponent } from './groups-list/group-create/group-create.component';
import { MeetingsCurrentComponent } from './meetings/meetings-current/meetings-current.component';
import { MeetingsPastComponent } from './meetings/meetings-past/meetings-past.component';
import { MeetingsCreatedComponent } from './meetings/meetings-created/meetings-created.component';
import { MeetingsCreateComponent } from './meetings/meetings-create/meetings-create.component';
import { StepDetailsComponent } from './meetings/meetings-create/step-details/step-details.component';
import { StepCalendarComponent } from './meetings/meetings-create/step-calendar/step-calendar.component';
import { GoogleComponent } from './profile/auth/google/google.component';
import { MicrosoftComponent } from './profile/auth/microsoft/microsoft.component';
import { MeetingsViewComponent } from './meetings/meetings-view/meetings-view.component';
import { MeetingsEditComponent } from './meetings/meetings-edit/meetings-edit.component';
import { IcsComponent } from './profile/auth/ics/ics.component';
import { ChangeCredentialsComponent } from './profile/change-credentials/change-credentials.component';
import { CanDeactivateGuard } from '../can-deactivate.guard';
import { ManageCalendarsComponent } from './profile/manage-calendars/manage-calendars.component';
import { AppleComponent } from './profile/auth/apple/apple.component';
import { DangerZoneComponent } from './profile/danger-zone/danger-zone.component';


const routes: Routes = [
  {
    path: '',
    component: AuthContentComponent,
    canActivateChild: [AuthGuard],
    children: [
      { path: '', redirectTo: "/dashboard", pathMatch: 'full'},
      { path: 'dashboard', component: DashboardComponent },
      { path: 'groups', component: GroupsListComponent },
      { path: 'groups/edit/:id', component: GroupEditComponent },
      { path: 'groups/create', component: GroupCreateComponent },
      { path: 'meetings', component: MeetingsComponent,
        children: [
          {path: 'created', component: MeetingsCreatedComponent},
          {path: 'current', component: MeetingsCurrentComponent},
          {path: 'past', component: MeetingsPastComponent},
          {path: '', component: MeetingsCurrentComponent},
        ]
      },
      { path: 'meetings/view/:id', component: MeetingsViewComponent},
      { path: 'meetings/edit/:id', component: MeetingsEditComponent, canDeactivate: [CanDeactivateGuard],
        children: [
          { path: 'details', component: StepDetailsComponent},
          { path: 'calendar', component: StepCalendarComponent}
        ]},
      { path: 'meetings/create', component: MeetingsCreateComponent, canDeactivate: [CanDeactivateGuard],
        children: [
          { path: 'details', component: StepDetailsComponent },
          { path: 'calendar', component: StepCalendarComponent }
        ] },
      { path: 'profile', component: ProfileComponent,
        children: [
          {path: '', component: ManageCalendarsComponent},
          { path: 'calendars', component: ManageCalendarsComponent, children: [
            { path: 'auth/google', component: GoogleComponent },
            { path: 'auth/microsoft', component: MicrosoftComponent },
            { path: 'auth/ics', component: IcsComponent },
            { path: 'auth/apple', component: AppleComponent }]
          },
          { path: 'danger-zone', component: DangerZoneComponent },
          { path: 'credentials', component: ChangeCredentialsComponent },
        ] 
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthedRoutingModule { }
