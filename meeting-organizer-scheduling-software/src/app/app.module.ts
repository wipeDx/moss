import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './auth-content/dashboard/dashboard.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegisterComponent } from './auth/register/register.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { GroupsListComponent } from './auth-content/groups-list/groups-list.component';
import { MeetingsComponent } from './auth-content/meetings/meetings.component';
import { ProfileComponent } from './auth-content/profile/profile.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthedModule } from './auth-content/authed.module';
import { AuthedRoutingModule } from './auth-content/authed-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from "@angular/common/http";
import { LogoutComponent } from './auth/logout/logout.component';
import { AlertComponent } from './alert/alert.component';
import { JwtInterceptor } from './helpers/jwt.interceptor';
import { ErrorInterceptor } from './helpers/error.interceptor';
import { OAuth2Client } from 'google-auth-library';
import { calendar_v3 } from 'googleapis';
import { environment } from 'src/environments/environment';
import { MsalModule } from '@azure/msal-angular';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ActivateComponent } from './auth/activate/activate.component';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    RegisterComponent,
    PageNotFoundComponent,
    GroupsListComponent,
    MeetingsComponent,
    ProfileComponent,
    LogoutComponent,
    AlertComponent,
    ActivateComponent
  ],
  imports: [
    BrowserModule,
    AuthedRoutingModule,
    AppRoutingModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    AuthedModule,
    HttpClientModule,
    MsalModule.forRoot({ 
      clientID: environment.M_API_APP_ID,
      redirectUri: environment.M_API_REDIRECT_URI
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: OAuth2Client, useValue: new OAuth2Client(environment.G_API_CLIENT_ID, environment.G_API_CLIENT_SECRET, environment.G_API_REDIRECT_URL)},
    { provide: calendar_v3.Calendar, useFactory: (auth: OAuth2Client) => new calendar_v3.Calendar({ auth }), deps: [OAuth2Client] },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
