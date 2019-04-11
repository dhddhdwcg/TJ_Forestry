import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import * as mapboxgl from 'mapbox-gl';
import { Map } from 'mapbox-gl';
import { AppState } from '../../services/app.service';
import { UtilsService } from '../../services/utils.service';
import { Customize } from './utils/customize.util';

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
  private tileBaseUrl: string = "http://60.30.105.251:8000";

  // mapboxgl地图对象
  public map: Map = null;

  // 自义定交互初始化
  public customize: any;
  
  @ViewChild('layout') 
  public layout: ElementRef;
  
  constructor(
    public appState: AppState,
    private utils: UtilsService,
		private router: Router
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
    this.utils.assign(mapboxgl.Map.prototype, 'setData', function(name: any, value: any) {
      this.global[name] = value;
    });

    /**
     * 获取数据
     * @param {String} name  数据名称
     */
    this.utils.assign(mapboxgl.Map.prototype, 'getData', function(name: any) {
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
          "openstreetmap-tiles": {
            "type": "raster",
            "tiles": [
              "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
            ],
            "tileSize": 256
          },
          "raster-tiles": {
            "type": "raster",
            "tiles": [
              "http://mt0.google.cn/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}",
              "http://mt1.google.cn/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}"
            ],
            "tileSize": 256
          },
          "raster-tiles-tj2018q2": {
            "type": "raster",
            "tiles": [
              "http://192.168.18.234/3857tiles/{z}/{x}/{y}.jpg"
            ],
            "tileSize": 256
          },
          "tj2018q3": {
            "type": "raster",
            "tiles": [
              this.tileBaseUrl + "/tiles/{z}/{x}/{y}.png"
            ],
            "tileSize": 256
          }
        },
        sprite: this.tileBaseUrl + "/vt/sprite",
        glyphs:  this.tileBaseUrl + "/vt/fonts/{fontstack}/{range}.pbf",
        layers: [
          {
            "id": "raster-tiles",
            "type": "raster",
            "source": "raster-tiles",
            "minzoom": 0,
            "maxzoom": 22
          }
        ]
      },
      center: [117.39573, 39.60868],
			zoom: 12
		});
    
    // 添加鼠标手势
    this.map.on('mousemove',  (event: any) => {
      let features = this.map.queryRenderedFeatures(event.point);
      this.map.getCanvas().style.cursor = (features.length) ? 'pointer' : 'inherit';
    });

    this.customize = new Customize(this.map);
  }

	/**
	 * 退出登录
	 */
	public quit() {
		window.localStorage.removeItem('token');
		window.localStorage.removeItem('uid');
		window.localStorage.removeItem('uname');
		this.router.navigate(['/login']);
	}
}
