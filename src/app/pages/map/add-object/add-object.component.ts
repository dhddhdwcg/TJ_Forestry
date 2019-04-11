import { Component, OnInit, Input } from '@angular/core';
import { Map } from 'mapbox-gl';
import { Subscription }   from 'rxjs';
import { AddLine } from '../utils/add-line.util';
import { AddPoint } from '../utils/add-point.util';
import { AddPolygon } from '../utils/add-polygon.util';
import { AppState } from '../../../services/app.service';
import { MissionService } from '../../../services/mission.service';

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

	// 订阅通信
	private subscription: Subscription;
	

  constructor(
		private appState: AppState,
		private missionService: MissionService
	) {
		this.subscription = missionService.missionAnnounced$.subscribe((mission: any) => {
			switch(mission.type) {
				case 'addObjectCancel':
				this.appState.get('addObjectType') && this.mapTools['add-' + this.appState.get('addObjectType')].constructor.destroy();
				break;

				case 'addObjectSubmit':
				this.appState.get('addObjectType') && this.mapTools['add-' + this.appState.get('addObjectType')].constructor.save();
				break;

				default:
				break;
			}
    });
	}

  ngOnInit() {
    this.mapTools['add-point'] = {
      constructor: new AddPoint(this.map, this.customize, this.appState),
      open: false
    };
    this.mapTools['add-line'] = {
      constructor: new AddLine(this.map, this.customize, this.appState),
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
		for (let item in this.mapTools) {
			if (type !== item && this.mapTools[item].open) {
				this.mapTools[item].constructor.destroy();
			}
		}
    let _tool = this.mapTools[type];
    if (_tool.open) {
      _tool.constructor.destroy();
			_tool.open = false;
			this.missionService.announceMission({
				type: 'isClick',
				value: true
			});
    } else{
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
		
		this.missionService.announceMission({
			type: 'isClick',
			value: false
		});
	}

}
