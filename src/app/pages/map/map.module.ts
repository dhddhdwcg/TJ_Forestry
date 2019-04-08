import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ShareModule } from '../../share/share.module';
import { HttpClientModule } from '@angular/common/http';
import { httpInterceptorProviders } from "../../interceptors";

import { MapComponent } from './map.component';
import { MapRoutingModule } from './map-routing.module';

import { AppState } from '../../services/app.service';
import { UtilsService } from '../../services/utils.service';

@NgModule({
  declarations: [
    MapComponent
  ],
  imports: [
    ShareModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MapRoutingModule
  ],
  providers: [
    AppState,
    UtilsService,
    httpInterceptorProviders
  ]
})
export class MapModule { }
