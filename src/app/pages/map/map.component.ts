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
  private tileBaseUrl: string = "http://60.30.105.251:8000";

  // mapboxgl地图对象
  public map: Map = null;

  // 自义定交互初始化
  private customize: any;

  // 地图工具
  private mapTools: object = {};
  
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
      center: [117.4691, 38.9032],
      zoom: 11
    });
    
    // 添加鼠标手势
    this.map.on('mousemove',  (event: any) => {
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
    } else{
      _tool.constructor.init(() => {
        _tool.open = false;
      });
    }
    _tool.open = !_tool.open;
  }
}
