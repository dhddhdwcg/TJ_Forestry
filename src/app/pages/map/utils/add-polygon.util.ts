declare const turf: any;
import * as mapboxgl from 'mapbox-gl';

/**
 * 添加多边形
 * @param {Object} map mapbox地图对象
 * @param {Object} customize 自义定交互对象
 */
export class AddPolygon {

	// 停止后的回调
	private stopCallback: any;

	// 是否执行添加
	private start: boolean = false;

	// 是否绑定点击和拖动
	private clickAndDrag: boolean = false;

	// 是否执行拖动
	private drag: boolean = false;

	// 执行拖动的选中点序列
	private dragIndex: number = 0;

	// 地图数据
	private geojson: any = {
		"type": "FeatureCollection",
		"features": []
	};

	// 绘制线的数据
	private linestring: any = {
		"type": "Feature",
		"geometry": {
			"type": "LineString", 
			"coordinates": [] 
		}
	}

	// 提示marker
	private tipsMarker: any;

	// 提示dom
	private tipsElement: HTMLElement = document.createElement('div');

	// 点的数组
	private points: any[] = [];

	// 节点数组
	private nodes: any[] = [];

	// 弹窗dom
	private popupElement: HTMLElement;

	// 弹窗关闭dom
	private popupCloseElement: HTMLElement;

	// GeoJSON 对象用于保存移动线
	private geojsonMoveLine: any = {
		"type": "FeatureCollection",
		"features": []
	};

	// 用于在点之间绘制一条可以移动线
	private moveLinestring: any = {
		"type": "Feature",
		"geometry": {
			"type": "LineString",
			"coordinates": []
		}
	};

	// 用于在点之间绘制一条线
	private polygon: any = {
		"type": "Feature",
		"geometry": {
			"type": "Polygon", 
			"coordinates": [] 
		}
	};

	constructor(
		private map: any,
		private customize: any,
		private appState: any
	) {
		this.tipsElement.className = 'measure-tips';
	}
	
	/**
	 * 初始化
	 * @param {any} callback
	 */
	public init(callback: any) {
		this.stopCallback = callback;
		if (!this.map.getData('AddPolygon')) {
			this.map.setData('AddPolygon', this);
		}
		this.start = true;
		this.points = [];
		this.geojson.features = [];

		if (!this.clickAndDrag) {
			this.handleClickAndDrag();
		}

		this.map.addSource('add-polygon-geojson', {
			"type": "geojson",
			"data": this.geojson
		});
		this.map.addLayer({
			id: 'add-polygon-fill',
			type: 'fill',
			source: 'add-polygon-geojson',
			paint: {
				'fill-color': '#FC641C',
				'fill-opacity': 0.1
			},
			filter: ['in', '$type', 'Polygon']
		});
		this.map.addLayer({
			id: 'add-polygon-line',
			type: 'line',
			source: 'add-polygon-geojson',
			paint: {
				'line-color': '#FC641C',
				'line-width': 3,
				'line-opacity': .7
			},
			filter: ['in', '$type', 'LineString']
		});
		this.map.addLayer({
			id: 'add-polygon-point',
			type: 'circle',
			source: 'add-polygon-geojson',
			paint: {
				'circle-radius': 5,
				'circle-color': '#ff0000',
				'circle-stroke-width': 2,
				'circle-stroke-color': '#ffffff'
			},
			filter: ['in', '$type', 'Point']
		});
		this.tipsMarker = new mapboxgl.Marker({
			element: this.tipsElement,
			anchor: 'top-left',
			offset: [18, 16]
		}).setLngLat([0, 0]).addTo(this.map);
		this.map.on('mousemove', this.handleMove);
		this.map.on('click', this.handleClick);
		this.map.once('dblclick', this.handleStop);
		this.customize.addCustomizeMove();
	}

	/**
	 * 点击事件
	 * @param {any} e 地图返回的对象
	 */
	private handleClick = function(e: any) {
		let _this = this.getData('AddPolygon');
		_this.points.push(_this.customize.getPoint());
		_this.draw();
	}



	/**
	 * 点击删除
	 * @param {any} e 地图返回的对象
	 */
	private handleClickRemove = function(e: any) {
		let _this = this.getData('AddPolygon');
		if(!_this.start) {
			let features = _this.map.queryRenderedFeatures(e.point, {
				layers: ['add-polygon-point']
			});
			if (features.length) {
				let _index = features[0].properties.index;
				_this.points.splice(_index, 1);
				if (_this.points.length < 2) {
					_this.destroy();
				} else {
					_this.draw();
				}
			}
		}
	}

	/**
	 * 移动点
	 * @param {any} e 地图返回的对象
	 */
	private handleDragMouseMove = function(e: any) {
		let _this = this.getData('AddPolygon');
		if(!_this.start && _this.drag) {
			let _newPoint = [e.lngLat.lng, e.lngLat.lat];
			let _capture = _this.customize.getCapture();
			let _zoom = _this.map.getZoom();
			if (_capture.captureData.length) {
				if (_capture.captureType === 'Point') {
					let from = turf.point([e.lngLat.lng, e.lngLat.lat]);
					let to = turf.point(_capture.captureData);
					if (turf.distance(from, to) < 655.36 / Math.pow(2, _zoom - 1)) {
						_newPoint = _capture.captureData;
					}
				} else {
					let line: any = turf.lineString(_capture.captureData);
					let pt: any = turf.point([e.lngLat.lng, e.lngLat.lat]);
					let snapped = (turf as any).nearestPointOnLine(line, pt);
					if (snapped.properties.dist < 655.36 / Math.pow(2, _zoom - 1)) {
						_newPoint = snapped.geometry.coordinates;
					}
				}
			}
			_this.points[_this.dragIndex] = _newPoint;
			_this.draw();
		}
	}

	/**
	 * 拖放操作开始
	 * @param {any} e 地图返回的对象
	 */
	private handleDragMouseDown = function(e: any) {
		let _this = this.getData('AddPolygon');
		if(!_this.start) {
			let features = _this.map.queryRenderedFeatures(e.point, {
				layers: ['add-polygon-point']
			});
			if (features.length) {
				e.preventDefault();
				_this.dragIndex = features[0].properties.index;
				_this.drag = true;
			}
		}
	}

	/**
	 * 拖放操作结束
	 * @param {any} e 地图返回的对象
	 */
	private handleDragMouseUp = function(e: any) {
		let _this = this.getData('AddPolygon');
		_this.drag = false;
	}

	/**
	 * 鼠标移动事件
	 */
	private handleMove = function(e: any) {
		let _this = this.getData('AddPolygon');
		if (_this.points.length) {
			_this.tipsElement.innerHTML = '<span>单击确定地点，双击结束</span>';
		} else {
			_this.tipsElement.innerHTML = '<span>单击确定起点</span>';
		}
		if (_this.points.length > 0) {
			if (_this.points.length > 1) {
				_this.points.pop();
			}
			_this.points.push(_this.customize.getPoint());
		};
		_this.tipsMarker.setLngLat(e.lngLat);
		_this.draw();
		// 在地图上显示操作的图标
		_this.map.getCanvas().style.cursor = (_this.start) ? 'crosshair' : 'inherit';
	}


	/**
	 * 绑定的停止
	 * @param {any} e 地图返回的对象
	 */
	private handleStop = function(e: any) {
		let that = this;
		that.doubleClickZoom.disable();
		let _this = that.getData('AddPolygon');
		_this.stop(e);
	}

	/**
	 * 停止
	 * @param {any} e 地图返回的对象
	 */
	private stop = function(e?: any) {
		this.start = false;
		this.map.off('click', this.handleClick);
		this.map.off('mousemove', this.handleMove);
		this.map.getCanvas().style.cursor = 'inherit';
		this.draw();
		this.tipsMarker.remove();
		if (e && e.lngLat) {
			this.appState.set('addObjectType', 'polygon');
			this.appState.set('addGeometry', this.polygon.geometry);
			this.appState.set('addFormData', {});
			this.appState.set('addObject', true)
		}
		setTimeout(() => {
			this.map.doubleClickZoom.enable();
		}, 100);
		this.customize.removeCustomizeMove();
	}

	/**
	 * 绘制路线
	 */
	private draw() {
		if (this.points.length > 2 && this.points[this.points.length - 3].join('') == this.points[this.points.length - 2].join('') && this.points[this.points.length - 2].join('') == this.points[this.points.length - 1].join('')) {
			this.points.pop();
			this.points.pop();
		}
		this.geojson.features = [];
		if (this.nodes.length) {
			this.nodes.forEach((node: any) => {
				node.remove();
			})
			this.nodes = [];
		}
		this.points.forEach((point: any, i: number) => {
			// 添加点
			let newPoint = {
				"type": "Feature",
				"geometry": {
						"type": "Point",
						"coordinates": point
				},
				"properties": {
						"id": String(new Date().getTime()),
						"index": i
				}
			};
			this.geojson.features.push(newPoint);
		});
		if (this.points.length > 2) {
			let _coordinate = JSON.parse(JSON.stringify(this.points));
			if (_coordinate[0].join('') !== _coordinate[_coordinate.length - 1].join('')) {
				_coordinate.push(_coordinate[0]);
			}
			this.polygon.geometry.coordinates = [_coordinate];
			this.geojson.features.push(this.polygon);
		};

		if (this.points.length) {
			let _newPoints = [];
			this.points.forEach( (poi: any) => {
				_newPoints.push(poi);
			})
			_newPoints.push(_newPoints[0]);
			this.linestring.geometry.coordinates = _newPoints;
			this.geojson.features.push(this.linestring);
			// 添加节点
			if (!this.start) {
				_newPoints.forEach((point: any, i: number) => {
					if (i > 0) {
						let _newPoi: [number, number] = [((point[0] - _newPoints[i - 1][0]) / 2) + _newPoints[i - 1][0], ((point[1] - _newPoints[i - 1][1]) / 2) + _newPoints[i - 1][1]];
						let _elementNode = document.createElement('div');
						_elementNode.className = 'measure-node';
						this.nodes.push(new mapboxgl.Marker({
							element: _elementNode,
							anchor: 'center'
						}).setLngLat(_newPoi).addTo(this.map));
						_elementNode.onclick = () => {
							this.points.splice(i, 0, _newPoi);
							this.draw();
						}
					}
				})
			}
		}
		this.map.getSource('add-polygon-geojson').setData(this.geojson);
	}


	/**
	 * 提交数据
	 */
	private save() {
		this.polygon.properties = {
			
		};
		this.customize.addCustomizeFeature(JSON.parse(JSON.stringify(this.polygon)));
		this.destroy();
	}



	/**
	 * 绑定点击和拖动
	 */
	private handleClickAndDrag = function() {
		this.clickAndDrag = true;
		this.map.on('click', this.handleClickRemove);
		this.map.on('mousedown', this.handleDragMouseDown);
		this.map.on('mousemove', this.handleDragMouseMove);
		this.map.on('mouseup', this.handleDragMouseUp);
	}

	/**
	 * 解除绑定点击和拖动
	 */
	private handleCancelClickAndDrag() {
		this.clickAndDrag = false;
		this.map.off('click', this.handleClickRemove);
		this.map.off('mousedown', this.handleDragMouseDown);
		this.map.off('mousemove', this.handleDragMouseMove);
		this.map.off('mouseup', this.handleDragMouseUp);
		this.map.setData('AddPolygon', null);
	}


	/**
	 * 注销
	 * @param {Number} index 要注销的序列号
	 */
	private destroy() {
		if (this.start) {
			this.stop();
		}
		this.map.removeLayer('add-polygon-line');
		this.map.removeLayer('add-polygon-point');
		this.map.removeLayer('add-polygon-fill');
		this.map.removeSource('add-polygon-geojson');
		if (this.stopCallback) {
			this.stopCallback();
		}
		if (this.nodes.length) {
			this.nodes.forEach((node: any) => {
				node.remove();
			})
			this.nodes = [];
		}
		this.handleCancelClickAndDrag();
		this.customize.removeCustomizeMove();
	}
	
}
