import * as mapboxgl from 'mapbox-gl';

/**
 * 添加点
 * @param {Object} map       mapbox地图对象
 * @param {Object} customize 自义定交互对象
 */

export class AddPoint {

	// 停止后的回调
	private stopCallback: any;

	// 是否执行添加
	private start: boolean = false;

	// 显示点的marker
	private marker: any;

	// marker dom
	private markerElement: HTMLImageElement;

	// 弹窗关闭dom
	private popupCloseElement: HTMLElement;


	constructor(
		private map: any,
		private customize: any,
		private appState: any
	) {
		
	}

	/**
	 * 初始化
	 * @param {any} callback
	 */
	public init(callback: any) {
		this.stopCallback = callback;
		if (!this.map.getData('AddPoint')) {
			this.map.setData('AddPoint', this);
		}
		this.markerElement = document.createElement('img');
		this.markerElement.src = 'assets/images/add-marker.svg';
		this.start = true;
		this.map.on('mousemove', this.handleMove);
		this.map.on('click', this.handleClick);
		this.customize.addCustomizeMove();
	}

	/**
	 * 点击事件
	 */
	private handleClick = function(e) {
		let _this = this.getData('AddPoint');
		_this.marker = new mapboxgl.Marker({
			element:  _this.markerElement,
			anchor: 'bottom',
			draggable: true,
		}).setLngLat(_this.customize.getPoint()).addTo(_this.map);
		_this.start = false;
		_this.map.getCanvas().style.cursor = 'inherit';
		_this.map.off('click', _this.handleClick);		
		_this.customize.removeCustomizeMove();
		_this.appState.set('addObjectType', 'point');
		_this.appState.set('addGeometry', {
			"type": "Point",
			"coordinates": [_this.marker.getLngLat().lng, _this.marker.getLngLat().lat]
		});
		_this.appState.set('addFormData', {});
		_this.appState.set('addObject', true);
	}

	/**
	 * 鼠标移动事件
	 */
	private handleMove = function(e) {
		let _this = this.getData('AddPoint');
		// 在地图上显示操作的图标
		_this.map.getCanvas().style.cursor = (_this.start) ? 'crosshair' : 'inherit';
	}

	/**
	 * 提交数据
	 */
	private save = function() {
		let _point =  {
			"type": "Feature",
			"geometry": {
					"type": "Point",
					"coordinates": [this.marker.getLngLat().lng, this.marker.getLngLat().lat]
			},
			"properties": {

			}
		};
		this.customize.addCustomizeFeature(JSON.parse(JSON.stringify(_point)));
		this.destroy();
	}


	/**
	 * 注销
	 * @param {Number} index 要注销的序列号
	 */
	public destroy() {
		if (this.marker) {
			this.marker.remove();
			this.marker = null;
		}

		this.map.off('click', this.handleClick);
		this.map.off('mousemove', this.handleMove);
		this.markerElement = null;
		if (this.stopCallback) {
			this.stopCallback();
		}
		this.customize.removeCustomizeMove();
	}
}