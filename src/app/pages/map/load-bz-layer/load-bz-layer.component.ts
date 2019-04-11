import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { Map } from 'mapbox-gl';
import { Subscription }   from 'rxjs';
import { MissionService } from '../../../services/mission.service';

@Component({
  selector: 'app-load-bz-layer',
  templateUrl: './load-bz-layer.component.html',
  styleUrls: ['./load-bz-layer.component.less']
})
export class LoadBzLayerComponent implements OnInit, OnDestroy {

	// mapboxgl baseVTUrl
	private baseVTUrl: string = 'http://60.30.105.251:8000/vt';

	// 地图是否加载
	public loaded: boolean = false;

	// 筛选的图层
	public layerFilter: any[] = [
		{
			id: 'zhenghe9zhen',
			title: '9镇整合数据',
			active: true,
		},
		{
			id: 'bdjbnt',
			title: '基本农田',
			active: true,
		},
		{
			id: 'kezhongshu',
			title: '可种树',
			active: true,
		},
		{
			id: 'yizhongshu',
			title: '已种树',
			active: true,
		}
	];

	@Input('map')
	private map: Map;

	// 订阅通信
	private subscription: Subscription;
	
	// 是否可点击地图查看数据
	private isClick: boolean = true;

  constructor(
		private missionService: MissionService
	) {
		this.subscription = missionService.missionAnnounced$.subscribe((mission: any) => {
			if (mission.type === 'isClick') {
				this.isClick = mission.value
			}
    });
	}

  ngOnInit() {
		this.map.on('load', () => {
			this.loaded = true;
			this.map.addLayer({
				'id': 'bdjbnt',
				'type': 'fill',
				'source': {
					'type': 'vector',
					'tiles': [this.baseVTUrl + '/baodi/pbfs/{z}/{x}/{y}.pbf'],
					'minzoom': 12,
					'maxzoom': 14
				},
				'source-layer': 'bdjbnt',
				'minzoom': 12,
				'maxzoom': 22,
				'layout': {},
				'paint': {
					'fill-color': '#00FF00',
					'fill-opacity': 0.2
				}
			});

			this.map.addLayer({
				'id': 'bdjbnt_border',
				'type': 'line',
				'source': {
					'type': 'vector',
					'tiles': [this.baseVTUrl + '/baodi/pbfs/{z}/{x}/{y}.pbf'],
					'minzoom': 13,
					'maxzoom': 14
				},
				'source-layer': 'bdjbnt',
				'minzoom': 13,
				'maxzoom': 22,
				'layout': {
					'line-join': 'round',
					'line-cap': 'round'
				},
				'paint': {
					'line-color': '#1c86ea',
					'line-width': 0.8
				}
			});

			this.map.addLayer({
				'id': 'kezhongshu',
				'type': 'fill',
				'source': {
					'type': 'vector',
					'tiles': [this.baseVTUrl + '/baodi/pbfs/{z}/{x}/{y}.pbf'],
					'minzoom': 12,
					'maxzoom': 14
				},
				'source-layer': 'kezhongshu',
				'minzoom': 12,
				'maxzoom': 22,
				'layout': {},
				'paint': {
					'fill-color': '#00fff6',
					'fill-opacity': 0.1
				}
			});

			this.map.addLayer({
				'id': 'kezhongshu_border',
				'type': 'line',
				'source': {
					'type': 'vector',
					'tiles': [this.baseVTUrl + '/baodi/pbfs/{z}/{x}/{y}.pbf'],
					'minzoom': 13,
					'maxzoom': 14
				},
				'source-layer': 'kezhongshu',
				'minzoom': 13,
				'maxzoom': 22,
				'layout': {
					'line-join': 'round',
					'line-cap': 'round'
				},
				'paint': {
					'line-color': '#bfbfbf',
					'line-width': 0.5
				}
			});

			this.map.addLayer({
				'id': 'yizhongshu',
				'type': 'fill',
				'source': {
					'type': 'vector',
					'tiles': [this.baseVTUrl + '/baodi/pbfs/{z}/{x}/{y}.pbf'],
					'minzoom': 12,
					'maxzoom': 14
				},
				'source-layer': 'yizhongshu',
				'minzoom': 12,
				'maxzoom': 22,
				'layout': {},
				'paint': {
					'fill-color': '#4d13d6',
					'fill-opacity': 0.3
				}
			});

			this.map.addLayer({
				'id': 'yizhongshu_border',
				'type': 'line',
				'source': {
					'type': 'vector',
					'tiles': [this.baseVTUrl + '/baodi/pbfs/{z}/{x}/{y}.pbf'],
					'minzoom': 13,
					'maxzoom': 14
				},
				'source-layer': 'yizhongshu',
				'minzoom': 13,
				'maxzoom': 22,
				'layout': {
					'line-join': 'round',
					'line-cap': 'round'
				},
				'paint': {
					'line-color': '#4f07f7',
					'line-width': 1
				}
			});

			this.map.addLayer({
				'id': 'zhenghe9zhen',
				'type': 'fill',
				'source': {
					'type': 'vector',
					'tiles': [this.baseVTUrl + '/baodi/zhenghe/{z}/{x}/{y}.pbf'],
					'minzoom': 12,
					'maxzoom': 14
				},
				'source-layer': 'zhenghe9zhen',
				'minzoom': 12,
				'maxzoom': 22,
				'layout': {},
				'paint': {
					'fill-color': '#fc2fe4',
					'fill-opacity': 0.8
				}
			});

			this.map.addLayer({
				'id': 'zhenghe9zhen_border',
				'type': 'line',
				'source': {
					'type': 'vector',
					'tiles': [this.baseVTUrl + '/baodi/zhenghe/{z}/{x}/{y}.pbf'],
					'minzoom': 12,
					'maxzoom': 14
				},
				'source-layer': 'zhenghe9zhen',
				'minzoom': 12,
				'maxzoom': 22,
				'layout': {
					'line-join': 'round',
					'line-cap': 'round'
				},
				'paint': {
					'line-color': '#c9e516',
					'line-width': 1.2
				}
			});

			this.map.addLayer({
				'id': 'zhen_line',
				'type': 'line',
				'source': {
					'type': 'vector',
					'tiles': [this.baseVTUrl + '/xzq/{z}/{x}/{y}.pbf'],
					'minzoom': 11,
					'maxzoom': 14
				},
				'source-layer': 'zhen',
				'layout': {
					'line-join': 'round',
					'line-cap': 'round'
				},
				'paint': {
					'line-color': '#fdfffd',
					'line-width': 1
				}
			});

			this.map.addLayer({
				'id': 'qu_line',
				'type': 'line',
				'source': {
					'type': 'vector',
					'tiles': [this.baseVTUrl + '/xzq/{z}/{x}/{y}.pbf'],
					'minzoom': 6,
					'maxzoom': 14
				},
				'source-layer': 'qu',
				'layout': {
					'line-join': 'round',
					'line-cap': 'round'
				},
				'paint': {
					'line-color': '#ed0404',
					'line-width': 1.5
				}
			});

			this.map.addLayer({
				'id': 'cun',
				'type': 'symbol',
				'source': {
					'type': 'vector',
					'tiles': [this.baseVTUrl + '/xingang/{z}/{x}/{y}.pbf'],
					'minzoom': 12,
					'maxzoom': 14
				},
				'source-layer': 'cun',
				'paint': {
					'text-color': '#ffffff',
					'text-halo-color': '#230303',
					'text-halo-width': 1.2,
					'text-halo-blur': 1.5
				}

			});

			this.map.addLayer({
				'id': 'zhen_label',
				'type': 'symbol',
				'source': {
					'type': 'vector',
					'tiles': [this.baseVTUrl + '/xingang/{z}/{x}/{y}.pbf'],
					'minzoom': 11,
					'maxzoom': 14
				},
				'source-layer': 'zhen_label',
				'paint': {
					'text-color': '#d0ea0e',
					'text-halo-color': '#140101',
					'text-halo-width': 2.5,
				}
			});

			this.map.addLayer({
				'id': 'qu_label',
				'type': 'symbol',
				'source': {
					'type': 'vector',
					'tiles': [this.baseVTUrl + '/xingang/{z}/{x}/{y}.pbf'],
					'minzoom': 6,
					'maxzoom': 14
				},
				'maxzoom': 14,
				'source-layer': 'qu_label',
				'paint': {
					'text-color': '#e00f0f',
					'text-halo-color': 'hsl(0, 0%, 100%)',
					'text-halo-width': 4,
					'text-halo-blur': 1
				}
			});
		});

		this.layerFilter.forEach((item) => {
			this.map.on('click', item.id, (e) => {
				if (this.isClick) {
					let coordinates = (e.features[0].geometry as any).coordinates.slice();
					while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
						coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
					}
					let content: string = this.exportFeatureToHTML(e.features[0]); 
					new mapboxgl.Popup().setLngLat(e.lngLat).setHTML(content).addTo(this.map);
				}
			});
		})
	}
	
	/**
	 * 显示feature的数据
	 * @param {any} feature
	 * @returns {string}
	 */
	private exportFeatureToHTML(feature: any) {
		let content = '';
		if (feature) {
			content =  "<table class='table table-hover no-margins'>";
			for(var p in feature.properties){
					content += "<tr><td><small>" + p  + "</small></td><td><i class='fa fa-clock-o'></i>"+ feature.properties[p] +"</td></tr>";
			}            
			content += "</table>";
		}
    return content;
	}
	
	/**
   * 设置图层的显示
   * @param {any} item 选中的图层数据
	 */
	public setLayerFilter(item: any) {
		item.active = !item.active;
		let visibility = this.map.getLayoutProperty(item.id, 'visibility');
		if (visibility === 'visible') {
			this.map.setLayoutProperty(item.id, 'visibility', 'none');
			this.map.setLayoutProperty(item.id + '_border', 'visibility', 'none');
		} else {
			this.map.setLayoutProperty(item.id, 'visibility', 'visible');
			this.map.setLayoutProperty(item.id + '_border', 'visibility', 'visible');
		}
	}
	
  ngOnDestroy() {
    // 页面注销时，回收内存
    this.subscription.unsubscribe();
  }

}
