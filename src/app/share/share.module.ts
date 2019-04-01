import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { AppState } from '../services/app.service';


@NgModule({
  exports: [
    CommonModule,
    NgZorroAntdModule
  ],
  imports: [
    CommonModule,
    NgZorroAntdModule,
  ],
  providers: [
    AppState
  ]
})
export class ShareModule {
}