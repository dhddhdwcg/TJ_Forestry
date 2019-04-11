import { Component, OnInit, Input } from '@angular/core';
import { Map } from 'mapbox-gl';
import { MeasureArea } from '../utils/measure-area.util';
import { MeasureDistance } from '../utils/measure-distance.util';
import { MissionService } from '../../../services/mission.service';

@Component({
  selector: 'app-measure',
  templateUrl: './measure.component.html',
  styleUrls: ['./measure.component.less'],
})
export class MeasureComponent implements OnInit {

  // 地图工具
  private mapTools: object = {};

	@Input('map')
	private map: Map;

  // 自义定交互初始化
	@Input('customize')
	private customize: any;

  constructor(
		private missionService: MissionService
	) {

	}

  ngOnInit() {
    // 工具初始化，并保存
    this.mapTools['measure-distance'] = {
      constructor: new MeasureDistance(this.map),
      open: false
    };
    this.mapTools['measure-area'] = {
      constructor: new MeasureArea(this.map),
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
			_tool.open = false;
			this.missionService.announceMission({
				type: 'isClick',
				value: true
			});
    } else {
      _tool.constructor.init(() => {
				_tool.open = false;
				this.missionService.announceMission({
					type: 'isClick',
					value: true
				});
      });
			_tool.open = true;
			this.missionService.announceMission({
				type: 'isClick',
				value: false
			});
    }
  }

}
