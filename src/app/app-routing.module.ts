import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { AuthGuard } from './guard/auth/auth.guard';
import { TokenGuard } from './guard/token/token.guard';

const routes: Routes = [
  {
    path: '', 
    component: AppComponent,
    children: [
      {
        path: '',
        canActivate: [AuthGuard],
        loadChildren: './pages/map/map.module#MapModule'
      },
      {
        path: 'login',
        canActivate: [TokenGuard],
        loadChildren: './pages/login/login.module#LoginModule'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
