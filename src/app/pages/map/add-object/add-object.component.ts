import { Component, OnInit, Input } from '@angular/core';
import { Map } from 'mapbox-gl';
import { AddLine } from '../utils/add-line.util';
import { AddPoint } from '../utils/add-point.util';
import { AddPolygon } from '../utils/add-polygon.util';
import { AppState } from '../../../services/app.service';

@Component({
  selector: 'app-add-object',
  templateUrl: './add-object.component.html',
  styleUrls: ['./add-object.component.less'],
})
export class AddObjectComponent implements OnInit {

  // 地图工具
  private mapTools: object = {};

	@Input('map')
	private map: Map;

  // 自义定交互初始化
	@Input('customize')
	private customize: any;

  constructor(
		private appState: AppState
	) {
		
	}

  ngOnInit() {
    this.mapTools['add-point'] = {
      constructor: new AddPoint(this.map, this.customize),
      open: false
    };
    this.mapTools['add-line'] = {
      constructor: new AddLine(this.map, this.customize),
      open: false
    };
    this.mapTools['add-polygon'] = {
      constructor: new AddPolygon(this.map, this.customize, this.appState),
      open: false
    };
  }

  /**
   * 打开工具集
   * @param {string} type 工具类型
   */
  public tools(type: string) {
    let _tool = this.mapTools[type];
    if (_tool.open) {
      _tool.constructor.destroy();
    } else{
      _tool.constructor.init(() => {
        _tool.open = false;
      });
    }
    _tool.open = !_tool.open;
	}

}
