import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ShareModule } from '../../share/share.module';
import { HttpClientModule } from '@angular/common/http';
import { httpInterceptorProviders } from "../../interceptors";

import { LoginComponent } from './login.component';
import { LoginRoutingModule } from './login-routing.module';


@NgModule({
  declarations: [
    LoginComponent
  ],
  imports: [
    ShareModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    LoginRoutingModule
  ],
  providers: [
    httpInterceptorProviders
  ]
})
export class LoginModule { }
