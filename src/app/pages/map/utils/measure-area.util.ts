declare const turf: any;
import * as mapboxgl from 'mapbox-gl';

/**
 * 测面积工具
 * @param {Object} map mapbox地图对象
 */
export class MeasureArea {
	// 储存测量图像
	private measure: any = {};

	// 当前绘制路线的序列号
	private index: number = 0;

	// 当前绘制路线的点
	private points: any[] = [];

	// 是否开始绘制
	private start: boolean = false;

	// 是否绑定点击和拖动
	private clickAndDrag: boolean = false;

	// 是否执行拖动
	private drag: boolean = false;

	// 执行拖动的点集合
	private dragPoints: any[] = [];

	// 执行拖动的选中点序列
	private dragPIndex: number = 0;

	// 执行拖动的点集合序列
	private dragIndex: number = 0;

	// 提示marker
	private tipsMarker: any;

	// 点击添加点
	private clickAdd: boolean = false;

	// 提示dom
	private tipsElement: HTMLElement = document.createElement('div');

	// 停止后的回调
	private stopCallback: any;

	constructor(
		private map: any
	) {
		this.tipsElement.className = 'measure-tips';
	}


	/**
	 * 初始化
	 * @param {any} callback
	 */
	public init(callback: any) {
		this.stopCallback = callback;
		if (!this.map.getData('MeasureArea')) {
			this.map.setData('MeasureArea', this);
		}
		this.points = [];
		this.start = true;
		this.index ++;
		if (!this.clickAndDrag) {
			this.handleClickAndDrag();
		}
		this.setTotal.call(this);
		this.tipsMarker = new mapboxgl.Marker({
			element: this.tipsElement,
			anchor: 'top-left',
			offset: [18, 16]
		}).setLngLat([0, 0]).addTo(this.map);
		this.measure['measure-area-' + this.index] = {
			// GeoJSON 对象用于保存测量功能
			geojson: {
				"type": "FeatureCollection",
				"features": []
			},
			// 用于在点之间绘制一条线
			polygon: {
				"type": "Feature",
				"geometry": {
					"type": "Polygon", 
					"coordinates": [] 
				}
			},
			// 用于在点之间绘制一条线
			linestring: {
				"type": "Feature",
				"geometry": {
					"type": "LineString", 
					"coordinates": [] 
				}
			},
			points: [],
			nodes: [],
			marker: null,
			closeMarker: null
		}
		this.map.addSource('measure-area-geojson-' + this.index, {
			"type": "geojson",
			"data": this.measure['measure-area-' + this.index].geojson
		});
		// 设置多边形的样式
		this.map.addLayer({
			id: 'measure-area-fill-' + this.index,
			type: 'fill',
			source: 'measure-area-geojson-' + this.index,
			paint: {
				'fill-color': '#FC641C',
				'fill-opacity': 0.1
			},
			filter: ['in', '$type', 'Polygon']
		});
		// 设置线的样式
		this.map.addLayer({
			id: 'measure-area-lines-' + this.index,
			type: 'line',
			source: 'measure-area-geojson-' + this.index,
			layout: {
					'line-cap': 'round',
					'line-join': 'round'
			},
			paint: {
				'line-color': '#FC641C',
				'line-width': 3,
				'line-opacity': .7,
				'line-dasharray': [.2, 1.5],
			},
			filter: ['in', '$type', 'LineString']
		});
		// 设置点的样式
		this.map.addLayer({
			id: 'measure-area-points-' + this.index,
			type: 'circle',
			source: 'measure-area-geojson-' + this.index,
			paint: {
				'circle-radius': 5,
				'circle-color': '#ff0000',
				'circle-stroke-width': 2,
				'circle-stroke-color': '#ffffff'
			},
			filter: ['in', '$type', 'Point']
		});
		this.map.on('click', this.handleClick);
		this.map.on('mousemove', this.handleMove);
		this.map.once('dblclick', this.handleStop);
	}

	/**
	 * 绘制路线
	 * @param {Number} index  序列号
	 * @param {Array}  points 选择的点
	 */
	private draw(index?: number, points?: any[]) {
		index = index ? index : this.index;
		points = points ? points : this.points;
		let _measureData = this.measure['measure-area-' + index];
		if (points.length > 2 && points[points.length - 3].join('') == points[points.length - 2].join('') && points[points.length - 2].join('') == points[points.length - 1].join('')) {
			points.pop();
			points.pop();
		}
		_measureData.geojson.features = [];
		_measureData.polygon.geometry.coordinates = [];
		if (_measureData.marker) {
			_measureData.marker.remove();
			_measureData.marker = null;
		}
		if (_measureData.closeMarker) {
			_measureData.closeMarker.remove();
			_measureData.closeMarker = null;
		}
		if (_measureData.nodes.length) {
			_measureData.nodes.forEach((node: any) => {
				node.remove();
			})
			_measureData.nodes = [];
		}
		let _newPoints = [];
		points.forEach( (poi: any) => {
			_newPoints.push(poi);
		})
		_newPoints.push(_newPoints[0])
		points.forEach((point: any, i: number) => {
			  // 添加点
				let newPoint = {
					"type": "Feature",
					"geometry": {
							"type": "Point",
							"coordinates": point
					},
					"properties": {
							"id": String(new Date().getTime()) + i,
							"type": "measure-area-point",
							"index": index,
							"pIndex": i,
							"coordinate": point.join('')
					}
				};
				_measureData.geojson.features.push(newPoint);
				if (i == points.length - 1 && !this.start) {
					// 添加marker
					let _elementDiv = document.createElement('div');
					_elementDiv.className = 'measure-label';
					let _area = 0;
					if (_newPoints.length > 3) {
						let _polygon: any = turf.polygon([_newPoints]);
						_area = turf.area(_polygon);
					}
					_elementDiv.className = 'measure-label total';
					_elementDiv.innerHTML = '总面积：<span class="red">'+ (_area / 1000000 ).toFixed(3) +'</span> 平方公里）';
					_measureData.marker = new mapboxgl.Marker({
						element: _elementDiv,
						offset: [0, -20]
					}).setLngLat(point).addTo(this.map);

					let _elementClose = document.createElement('div');
					_elementClose.className = 'measure-close';
					_elementClose.setAttribute('data-index', index.toString())
					_measureData.closeMarker = new mapboxgl.Marker({
						element: _elementClose,
						anchor: 'right',
						offset: [24, 6]
					}).setLngLat(point).addTo(this.map);
					_elementClose.onclick = (event) => {
						event.stopPropagation();
						this.destroy(Number(_elementClose.getAttribute('data-index')));
					}
				}
		})
		
		if (points.length > 1) {
			_measureData.polygon.geometry.coordinates = [points];
			_measureData.geojson.features.push(_measureData.polygon);
			_measureData.linestring.geometry.coordinates = _newPoints;
			_measureData.geojson.features.push(_measureData.linestring);
		}

		// 添加节点
		if (!this.start) {
			_newPoints.forEach((point: any, i: number) => {
				if (i > 0) {
					let _newPoi: [number, number] = [((point[0] - _newPoints[i - 1][0]) / 2) + _newPoints[i - 1][0], ((point[1] - _newPoints[i - 1][1]) / 2) + _newPoints[i - 1][1]];
					let _elementNode = document.createElement('div');
					_elementNode.className = 'measure-node';
					_measureData.nodes.push(new mapboxgl.Marker({
						element: _elementNode,
						anchor: 'center'
					}).setLngLat(_newPoi).addTo(this.map));
					_elementNode.onclick = () => {
						points.splice(i, 0, _newPoi);
						this.draw(index, points);
					}
				}
			})
		}

		_measureData.points = points;
		this.map.getSource('measure-area-geojson-' + index).setData(_measureData.geojson);
		this.setTotal.call(this);
	}

	/**
	 * 点击事件
	 * @param {any} e 地图返回的对象
	 */
	private handleClick = function(e: any) {
		let _this = this.getData('MeasureArea');
		if (_this.measure['measure-area-' + _this.index].geojson.features.length > 1) {
			_this.measure['measure-area-' + _this.index].geojson.features.pop()
		};
		_this.clickAdd = true;
		if (_this.points.length) {
			_this.points.push(_this.points[_this.points.length - 1]);
		} else {
			_this.points.push([e.lngLat.lng, e.lngLat.lat]);
		}
		_this.draw();
	}

	/**
	 * 鼠标移动事件
	 * @param {any} e 地图返回的对象
	 */
	private handleMove = function(e: any) {
		let _this = this.getData('MeasureArea');
		// 在地图上显示操作的图标
		_this.map.getCanvas().style.cursor = (_this.start) ? 'url("assets/images/ruler.cur") 3 6, crosshair' : 'inherit';
		_this.moveLine(e);
	}

	/**
	 * 添加可移动的线
	 * @param {any} e 地图返回的对象
	 */
	private moveLine(e: any) {
		if (this.points.length > 0) {
			if (this.points.length > 1) {
				this.points.pop();
			}
			this.points.push([e.lngLat.lng, e.lngLat.lat]);
		};
		this.setTotal.call(this);
		this.tipsMarker.setLngLat(e.lngLat);
		this.draw();
	}

	/**
	 * 点击删除
	 * @param {any} e 地图返回的对象
	 */
	private handleClickRemove = function(e: any) {
		let _this = this.getData('MeasureArea');
		if(!_this.start) {
			let features = _this.map.queryRenderedFeatures(e.point);
			if (features[0] && features[0].properties && features[0].properties.type === 'measure-area-point') {
				let _index = features[0].properties.index;
				let _points =  _this.measure['measure-area-' + _index].points;
				_points = _points.filter((point: any) => {
					return point.join('') != features[0].properties.coordinate;
				})
				if (_points.length < 3) {
					_this.destroy(_index);
				} else {
					_this.draw(_index, _points);
				}
			}
		}
	}

	/**
	 * 移动点
	 * @param {any} e 地图返回的对象
	 */
	private handleDragMouseMove = function(e: any) {
		let _this = this.getData('MeasureArea');
		if(!_this.start && _this.drag) {
			_this.dragPoints[_this.dragPIndex] = [e.lngLat.lng, e.lngLat.lat];
			_this.draw(_this.dragIndex, _this.dragPoints);
		}
	}

	/**
	 * 拖放操作开始
	 * @param {any} e 地图返回的对象
	 */
	private handleDragMouseDown = function(e: any) {
		let _this = this.getData('MeasureArea');
		if(!_this.start) {
			let features = _this.map.queryRenderedFeatures(e.point);
			if (features[0] && features[0].properties && features[0].properties.type === 'measure-area-point') {
				e.preventDefault();
				_this.dragIndex = features[0].properties.index;
				_this.dragPIndex = features[0].properties.pIndex;
				_this.dragPoints = _this.measure['measure-area-' + _this.dragIndex].points;
				_this.drag = true;
			}
		}
	}

	/**
	 * 拖放操作结束
	 * @param {any} e 地图返回的对象
	 */
	private handleDragMouseUp  = function(e: any) {
		let _this = this.getData('MeasureArea');
		_this.drag = false;
	}

	/**
	 * 设置总长度
	 */
	private setTotal() {
		if (this.points.length < 3) {
			this.tipsElement.innerHTML = '<span>单击确定地点</span>';
		} else{
			let _newPoints = [];
			this.points.forEach(function (poi) {
				_newPoints.push(poi);
			})
			_newPoints.push(_newPoints[0])
			let _polygon = turf.polygon([_newPoints]);
			let _area = turf.area(_polygon);
			let _total = (_area / 1000000 ).toFixed(3) + ' 平方公里';
			this.tipsElement.innerHTML = '<h2>' + _total + '</h2><span>单击确定地点，双击结束</span>';
		}
	} 

	/**
	 * 绑定的停止
	 */
	private handleStop = function () {
		let that = this;
		that.doubleClickZoom.disable();
		let _this = that.getData('MeasureArea');
		_this.stop(true);
	}

	/**
	 * 停止
	 * @param {Boolean} dblclick  是否为点击传递的函数
	 */
	private stop = function (dblclick?: boolean) {
		if (this.points.length > 2 || !dblclick) {
			this.start = false;
			this.map.off('click', this.handleClick);
			this.map.off('mousemove', this.handleMove);
			this.map.getCanvas().style.cursor = 'inherit';
			this.tipsMarker.remove();
			this.draw();
			if (this.stopCallback) {
				this.stopCallback();
			}
		} else {
			this.map.once('dblclick', this.handleStop);
		}
		setTimeout(() => {
			this.map.doubleClickZoom.enable();
		}, 100);
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
	private handleCancelClickAndDrag = function() {
		this.clickAndDrag = false;
		this.map.off('click', this.handleClickRemove);
		this.map.off('mousedown', this.handleDragMouseDown);
		this.map.off('mousemove', this.handleDragMouseMove);
		this.map.off('mouseup', this.handleDragMouseUp);
		this.map.setData('MeasureArea', null);
	}


	/**
	 * 注销
	 * @param {Number} index 要注销的序列号
	 */
	public destroy(index: number) {
		if (!index) {
			this.map.off('dblclick', this.handleStop);
			this.stop();
			index = this.index;
		}
		this.map.removeLayer('measure-area-fill-' + index);
		this.map.removeLayer('measure-area-lines-' + index);
		this.map.removeLayer('measure-area-points-' + index);
		this.map.removeSource('measure-area-geojson-' + index);
		let _measureData = this.measure['measure-area-' + index];
		if (_measureData.marker) {
			_measureData.marker.remove();
			_measureData.marker = null;
		}
		if (_measureData.closeMarker) {
			_measureData.closeMarker.remove();
			_measureData.closeMarker = null;
		}
		if (_measureData.nodes.length) {
			_measureData.nodes.forEach((node: any) => {
				node.remove();
			})
			_measureData.nodes = [];
		}
		delete this.measure['measure-area-' + index];
		if (Object.getOwnPropertyNames(this.measure).length == 0) {
			this.handleCancelClickAndDrag();
		}
	}
}



