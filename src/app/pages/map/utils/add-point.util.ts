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

	// 弹窗dom
	private popupElement: HTMLElement;

	// 弹窗关闭dom
	private popupCloseElement: HTMLElement;


	constructor(
		private map: any,
		private customize: any
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

		this.popupElement = document.createElement('div');
		this.popupElement.className = 'tools-add-form';
		this.popupElement.innerHTML = '<div class="list"><label for="add-point-name">名称：</label><input id="add-point-name" /></div><div class="list"><label for="add-point-remark">备注：</label><textarea id="add-point-remark" rows="2"></textarea></div><div class="submit"><input id="add-point-submit" type="button" value="提交"></div>';
		this.popupCloseElement = document.createElement('div');
		this.popupCloseElement.className = 'tools-add-form-close';
		this.popupCloseElement.title = '关闭';
		this.popupCloseElement.innerHTML = '×';
		this.popupElement.appendChild(this.popupCloseElement);
		this.popupCloseElement.onclick = () => {
			this.destroy();
		}
		this.start = true;
		this.map.on('mousemove', this.handleMove);
		this.map.on('click', this.handleClick);
		this.customize.addCustomizeMove();
	}

	/**
	 * 点击事件
	 */
	private handleClick = function(e) {
		var _this = this.getData('AddPoint');
		_this.marker = new mapboxgl.Marker({
			element:  _this.markerElement,
			anchor: 'bottom',
			draggable: true,
		}).setLngLat(_this.customize.getPoint()).addTo(_this.map);

		document.body.appendChild(_this.popupElement);

		_this.start = false;
		_this.map.getCanvas().style.cursor = 'inherit';
		_this.map.off('click', _this.handleClick);		
		_this.customize.removeCustomizeMove();
		document.getElementById('add-point-submit').addEventListener('click', function () {
			_this.save();
		})
	}

	/**
	 * 鼠标移动事件
	 */
	private handleMove = function(e) {
		var _this = this.getData('AddPoint');
		// 在地图上显示操作的图标
		_this.map.getCanvas().style.cursor = (_this.start) ? 'crosshair' : 'inherit';
	}

	/**
	 * 提交数据
	 */
	private save = function() {
		var _name: string = (document.getElementById('add-point-name') as HTMLInputElement).value;
		var _remark: string = (document.getElementById('add-point-remark') as HTMLInputElement).value;
		if (!_name.length) {
			alert('请填写名称');
			return false;
		}
		if (!_remark.length) {
			alert('请填写备注');
			return false;
		}
		var _point =  {
			"type": "Feature",
			"geometry": {
					"type": "Point",
					"coordinates": [this.marker.getLngLat().lng, this.marker.getLngLat().lat]
			},
			"properties": {
					"name": _name,
					"remark": _remark,
					"id": String(new Date().getTime())
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
		if (this.popupElement) {
			document.body.removeChild(this.popupElement);
		}
		this.popupElement = null;
		this.markerElement = null;
		if (this.stopCallback) {
			this.stopCallback();
		}
		this.customize.removeCustomizeMove();
	}
}