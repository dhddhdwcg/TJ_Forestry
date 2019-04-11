import * as mapboxgl from 'mapbox-gl';

/**
 * 添加线
 * @param {Object} map mapbox地图对象
 * @param {Object} customize 自义定交互对象
 */
export class AddLine {

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
	}

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
		if (!this.map.getData('AddLine')) {
			this.map.setData('AddLine', this);
		}
		this.start = true;
		this.points = [];
		this.geojson.features = [];

		if (!this.clickAndDrag) {
			this.handleClickAndDrag();
		}
		
		this.map.addSource('add-line-geojson-move-line', {
			"type": "geojson",
			"data": this.geojsonMoveLine
		});
		this.map.addLayer({
			id: 'add-line-move-line',
			type: 'line',
			source: 'add-line-geojson-move-line',
			paint: {
				'line-color': '#FC641C',
				'line-width': 3,
				'line-opacity': .6
			},
			filter: ['in', '$type', 'LineString']
		});
		this.map.addSource('add-line-geojson', {
			"type": "geojson",
			"data": this.geojson
		});
		this.map.addLayer({
			id: 'add-line-line',
			type: 'line',
			source: 'add-line-geojson',
			paint: {
				'line-color': '#FC641C',
				'line-width': 3,
				'line-opacity': .6
			},
			filter: ['in', '$type', 'LineString']
		});
		this.map.addLayer({
			id: 'add-line-point',
			type: 'circle',
			source: 'add-line-geojson',
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
		let _this = this.getData('AddLine');
		_this.points.push(_this.customize.getPoint());
		_this.draw();
	}



	/**
	 * 点击删除
	 * @param {any} e 地图返回的对象
	 */
	private handleClickRemove = function(e: any) {
		let _this = this.getData('AddLine');
		if(!_this.start) {
			let features = _this.map.queryRenderedFeatures(e.point, {
				layers: ['add-line-point']
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
		let _this = this.getData('AddLine');
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
		let _this = this.getData('AddLine');
		if(!_this.start) {
			let features = _this.map.queryRenderedFeatures(e.point, {
				layers: ['add-line-point']
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
		let _this = this.getData('AddLine');
		_this.drag = false;
	}

	/**
	 * 鼠标移动事件
	 */
	private handleMove = function(e: any) {
		let _this = this.getData('AddLine');
		if (_this.points.length) {
			_this.tipsElement.innerHTML = '<span>单击确定地点，双击结束</span>';
		} else {
			_this.tipsElement.innerHTML = '<span>单击确定起点</span>';
		}
		// 在地图上显示操作的图标
		_this.map.getCanvas().style.cursor = (_this.start) ? 'crosshair' : 'inherit';
		_this.moveLine(e);
	}



	/**
	 * 添加可移动的线
	 * @param {any} e 地图返回的对象
	 */
	private moveLine(e: any) {
		if (this.points.length > 0) {
			let _point = this.customize.getPoint().length ? this.customize.getPoint() : [e.lngLat.lng, e.lngLat.lat];
			this.moveLinestring.geometry.coordinates = [
				this.points[this.points.length - 1],
				_point
			]
			this.geojsonMoveLine.features = [this.moveLinestring];
			let _linestring = {
				"type": "Feature",
				"geometry": {
					"type": "LineString", 
					"coordinates": JSON.parse(JSON.stringify(this.points)) 
				}
			};
			_linestring.geometry.coordinates.push(_point);
		} else {
			this.geojsonMoveLine.features = [{
				"type": "FeatureCollection",
				"features": []
			}];
		};
		this.tipsMarker.setLngLat(e.lngLat);
		this.map.getSource('add-line-geojson-move-line').setData(this.geojsonMoveLine);
	}

	/**
	 * 绑定的停止
	 * @param {any} e 地图返回的对象
	 */
	private handleStop = function(e: any) {
		let that = this;
		that.doubleClickZoom.disable();
		let _this = that.getData('AddLine');
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
		this.destroyMoveLine();
		this.map.getCanvas().style.cursor = 'inherit';
		this.draw();
		this.tipsMarker.remove();
		if (e && e.lngLat) {
			this.appState.set('addObject', true);
			this.appState.set('addObjectType', 'line');
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
		if (this.points.length > 1 && this.points[this.points.length - 2].join('') == this.points[this.points.length - 1].join('')) {
			this.points.pop();
		}
		if (this.nodes.length) {
			this.nodes.forEach((node) => {
				node.remove();
			})
			this.nodes = [];
		}
		this.geojson.features = [];
		this.points.forEach((point, i) => {
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
		})
		this.linestring.geometry.coordinates = [];
		this.linestring.geometry.coordinates = this.points.map((point) => {
			return point;
		});

		// 添加节点
		if (!this.start) {
			this.points.forEach((point, i) => {
				if (i > 0) {
					let _newPoi: [number, number] = [((point[0] - this.points[i - 1][0]) / 2) + this.points[i - 1][0], ((point[1] - this.points[i - 1][1]) / 2) + this.points[i - 1][1]];
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
		this.geojson.features.push(this.linestring);
		this.map.getSource('add-line-geojson').setData(this.geojson);
	}


	/**
	 * 提交数据
	 */
	private save() {
		this.linestring.properties = {

		};
		this.customize.addCustomizeFeature(JSON.parse(JSON.stringify(this.linestring)));
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
		this.map.setData('AddLine', null);
	}

	/**
	 * 注销移动线
	 */
	private destroyMoveLine() {
		this.map.removeLayer('add-line-move-line');
		this.map.removeSource('add-line-geojson-move-line');
		this.geojsonMoveLine = {
			"type": "FeatureCollection",
			"features": []
		};
		this.moveLinestring = {
			"type": "Feature",
			"geometry": {
				"type": "LineString",
				"coordinates": []
			}
		};
	}


	/**
	 * 注销
	 * @param {Number} index 要注销的序列号
	 */
	private destroy() {
		if (this.start) {
			this.stop();
		}
		this.map.removeLayer('add-line-line');
		this.map.removeLayer('add-line-point');
		this.map.removeSource('add-line-geojson');
		if (this.stopCallback) {
			this.stopCallback();
		}
		if (this.nodes.length) {
			this.nodes.forEach((node) => {
				node.remove();
			})
			this.nodes = [];
		}
		this.handleCancelClickAndDrag();
		this.customize.removeCustomizeMove();
	}
	
}
