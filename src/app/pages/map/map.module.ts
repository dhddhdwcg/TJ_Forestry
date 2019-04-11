import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ShareModule } from '../../share/share.module';
import { HttpClientModule } from '@angular/common/http';
import { httpInterceptorProviders } from "../../interceptors";

import { MapComponent } from './map.component';
import { MapRoutingModule } from './map-routing.module';

import { AppState } from '../../services/app.service';
import { MissionService } from '../../services/mission.service';
import { UtilsService } from '../../services/utils.service';
import { LoadBzLayerComponent } from './load-bz-layer/load-bz-layer.component';
import { AddObjectComponent } from './add-object/add-object.component';
import { MeasureComponent } from './measure/measure.component';
import { ModalComponent } from './modal/modal.component';

@NgModule({
  declarations: [
    MapComponent,
    LoadBzLayerComponent,
    AddObjectComponent,
    MeasureComponent,
    ModalComponent
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
		httpInterceptorProviders,
		MissionService
  ]
})
export class MapModule { }
