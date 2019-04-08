import { Component, OnInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { Map } from 'mapbox-gl';
import { AppState } from '../../services/app.service';
import { UtilsService } from '../../services/utils.service';
import { Customize } from './utils/customize.util';
import { AddLine } from './utils/add-line.util';
import { AddPoint } from './utils/add-point.util';
import { AddPolygon } from './utils/add-polygon.util';
import { MeasureArea } from './utils/measure-area.util';
import { MeasureDistance } from './utils/measure-distance.util';

@Component({
	selector: 'app-map',
	templateUrl: './map.component.html',
	styleUrls: [
		'./map.component.less',
	]
})
export class MapComponent implements OnInit {

	// mapboxgl的token
	private accessToken: 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

	// mapboxgl tileBaseUrl
	private tileBaseUrl: string = 'http://60.30.105.251:8000';

	// mapboxgl baseVTUrl
	private baseVTUrl: string = 'http://60.30.105.251:8000/vt';

	// mapboxgl地图对象
	public map: Map = null;

	// 自义定交互初始化
	private customize: any;

	// 地图工具
	private mapTools: object = {};

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

	// 地图是否加载
	public loaded: boolean = false;

	constructor(
		public appState: AppState,
		private utils: UtilsService
	) {
		// 添加地图accessToken
		this.utils.assign(mapboxgl, 'accessToken', this.accessToken);

		// 添加地图对象数据储存对象
		this.utils.assign(mapboxgl.Map.prototype, 'global', {});

    /**
     * 储存数据
     * @param {String} name  数据名称
     * @param {String} value 数据值
     */
		this.utils.assign(mapboxgl.Map.prototype, 'setData', function (name: any, value: any) {
			this.global[name] = value;
		});

    /**
     * 获取数据
     * @param {String} name  数据名称
     */
		this.utils.assign(mapboxgl.Map.prototype, 'getData', function (name: any) {
			return this.global[name];
		});
	}

	ngOnInit() {
		this.map = new mapboxgl.Map({
			container: 'map',
			attributionControl: true,
			style: {
				version: 8,
				sources: {
					'openstreetmap-tiles': {
						'type': 'raster',
						'tiles': [
							'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
							'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
							'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
						],
						'tileSize': 256
					},
					'raster-tiles': {
						'type': 'raster',
						'tiles': [
							'http://mt0.google.cn/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}',
							'http://mt1.google.cn/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}'
						],
						'tileSize': 256
					},
					'raster-tiles-tj2018q2': {
						'type': 'raster',
						'tiles': [
							'http://192.168.18.234/3857tiles/{z}/{x}/{y}.jpg'
						],
						'tileSize': 256
					},
					'tj2018q3': {
						'type': 'raster',
						'tiles': [
							this.tileBaseUrl + '/tiles/{z}/{x}/{y}.png'
						],
						'tileSize': 256
					}
				},
				sprite: this.tileBaseUrl + '/vt/sprite',
				glyphs: this.tileBaseUrl + '/vt/fonts/{fontstack}/{range}.pbf',
				layers: [
					{
						'id': 'raster-tiles',
						'type': 'raster',
						'source': 'raster-tiles',
						'minzoom': 0,
						'maxzoom': 22
					}
				]
			},
			center: [117.39573, 39.60868],
			zoom: 12
		});

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
				// 'filter':['==', 'GHDL', '基本农田'],
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
				// 'filter':['==', 'GHDL', '基本农田'],
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

		// 添加鼠标手势
		this.map.on('mousemove', (event: any) => {
			let features = this.map.queryRenderedFeatures(event.point);
			this.map.getCanvas().style.cursor = (features.length) ? 'pointer' : 'inherit';
		});

		this.customize = new Customize(this.map);

		// 工具初始化，并保存
		this.mapTools['measure-distance'] = {
			constructor: new MeasureDistance(this.map),
			open: false
		};
		this.mapTools['measure-area'] = {
			constructor: new MeasureArea(this.map),
			open: false
		};
		this.mapTools['add-point'] = {
			constructor: new AddPoint(this.map, this.customize),
			open: false
		};
		this.mapTools['add-line'] = {
			constructor: new AddLine(this.map, this.customize),
			open: false
		};
		this.mapTools['add-polygon'] = {
			constructor: new AddPolygon(this.map, this.customize),
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
		} else {
			_tool.constructor.init(() => {
				_tool.open = false;
			});
		}
		_tool.open = !_tool.open;
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
}
