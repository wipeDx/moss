import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from "./auth/login/login.component";
import { RegisterComponent } from './auth/register/register.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { AuthGuard } from './auth/auth.guard';
import { AuthContentComponent } from './auth-content/auth-content.component';
import { LogoutComponent } from './auth/logout/logout.component';
import { ActivateComponent } from './auth/activate/activate.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent, data: { animation: 'login' } },
  { path: 'register', component: RegisterComponent, data: { animation: 'register' } },
  { path: 'logout', component: LogoutComponent},
  { path: 'activate', component: ActivateComponent},
  { path: '', component: AuthContentComponent, canActivate: [AuthGuard] },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
