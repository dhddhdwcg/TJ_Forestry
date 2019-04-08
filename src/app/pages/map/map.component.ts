import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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

  // 开启鼠标捕捉功能
  private capture: boolean = false;

  // 鼠标按下的位置
  private downPostion: any = {};

  // 弹窗的偏移量
  private offset: any = {
    x: 0,
    y: 0
  };

  
  @ViewChild('modal') 
  private modal: ElementRef;
  
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
      constructor: new AddPolygon(this.map, this.customize, this.appState),
      open: false
    };

    window.addEventListener('mouseup', () => {
      this.mouseup();
    })
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

  /**
   * 弹窗标题栏，鼠标按下事件
   * @param {event} event 
   */
  modalMousedown(event: any) {
    this.capture = true;
    this.downPostion = {
      x: event.clientX,
      y: event.clientY
    }
  }

  /**
   * 鼠标移动事件
   * @param {event} event 
   */
  mousemove(event: any) {
    if (this.capture) {
      this.offset = {
        x: event.clientX - this.downPostion.x,
        y: event.clientY - this.downPostion.y
      };
    }
  }

  /**
   * 鼠标按键抬起事件
   */
  mouseup() {
    this.capture = false;
    let _sX = this.modal.nativeElement.offsetLeft + this.offset.x;
    if (_sX < 10) {
      _sX = 10;
    }
    if (_sX +  this.modal.nativeElement.offsetWidth > document.body.offsetWidth - 10) {
      _sX = document.body.offsetWidth - this.modal.nativeElement.offsetWidth - 10;
    }
    let _sY = this.modal.nativeElement.offsetTop + this.offset.y;
    if (_sY < 74) {
      _sY = 74;
    }
    if (_sY + this.modal.nativeElement.offsetHeight > document.body.offsetHeight - 10) {
      _sY = document.body.offsetHeight - this.modal.nativeElement.offsetHeight - 10;
    }

    this.modal.nativeElement.style.left = _sX + 'px';
    this.modal.nativeElement.style.top = _sY + 'px';
    this.offset = {
      x: 0,
      y: 0
    };
  }
}
