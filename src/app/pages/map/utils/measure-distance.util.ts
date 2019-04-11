import * as mapboxgl from 'mapbox-gl';
import { lineDistance } from 'turf';

/**
 * 测距工具
 * @param {Object} map mapbox地图对象
 */

export class MeasureDistance {

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

	// 提示dom
	private tipsElement: HTMLElement = document.createElement('div');

	// 停止后的回调
	private stopCallback: any;

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
		if (!this.map.getData('MeasureDistance')) {
			this.map.setData('MeasureDistance', this);
		}
		this.points = [];
		this.start = true;
		this.index ++;
		if (!this.clickAndDrag) {
			this.handleClickAndDrag();
		}
		this.map.addSource('measure-distance-geojson-move-line', {
			type: "geojson",
			data: this.geojsonMoveLine,
		});
		this.map.addLayer({
			id: 'measure-distance-move-line',
			type: 'line',
			source: 'measure-distance-geojson-move-line',
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
		this.setTotal.call(this, true);
		this.tipsMarker = new mapboxgl.Marker({
			element: this.tipsElement,
			anchor: 'top-left',
			offset: [18, 16]
		}).setLngLat([0, 0]).addTo(this.map);
		this.measure['measure-distance-' + this.index] = {
			// GeoJSON 对象用于保存测量功能
			geojson: {
				"type": "FeatureCollection",
				"features": []
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
			markers: [],
			nodes: [],
			closeMarker: null
		}
		this.map.addSource('measure-distance-geojson-' + this.index, {
			"type": "geojson",
			"data": this.measure['measure-distance-' + this.index].geojson
		});
		// 设置线的样式
		this.map.addLayer({
			id: 'measure-distance-lines-' + this.index,
			type: 'line',
			source: 'measure-distance-geojson-' + this.index,
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
			id: 'measure-distance-points-' + this.index,
			type: 'circle',
			source: 'measure-distance-geojson-' + this.index,
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
	 * 点击事件
	 * @param {any} e 地图返回的对象
	 */
	private handleClick = function(e: any) {
		let _this = this.getData('MeasureDistance');
		if (_this.measure['measure-distance-' + _this.index].geojson.features.length > 1) {
			_this.measure['measure-distance-' + _this.index].geojson.features.pop()
		};
		
		_this.points.push([e.lngLat.lng, e.lngLat.lat]);
		_this.draw();
	}

	/**
	 * 点击删除
	 * @param {any} e 地图返回的对象
	 */
	private handleClickRemove = function(e: any) {
		let _this = this.getData('MeasureDistance');
		if(!_this.start) {
			let features = _this.map.queryRenderedFeatures(e.point);
			if (features[0] && features[0].properties && features[0].properties.type === 'measure-distance-point') {
				let _index: number = features[0].properties.index;
				let _points: any =  _this.measure['measure-distance-' + _index].points;
				_points = _points.filter((point: any) => {
					return point.join('') != features[0].properties.coordinate;
				})
				if (_points.length < 2) {
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
		let _this = this.getData('MeasureDistance');
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
		let _this = this.getData('MeasureDistance');
		if(!_this.start) {
			let features = _this.map.queryRenderedFeatures(e.point);
			if (features[0] && features[0].properties && features[0].properties.type === 'measure-distance-point') {
				e.preventDefault();
				_this.dragIndex = features[0].properties.index;
				_this.dragPIndex = features[0].properties.pIndex;
				_this.dragPoints = _this.measure['measure-distance-' + _this.dragIndex].points;
				_this.drag = true;
			}
		}
	}

	/**
	 * 拖放操作结束
	 * @param {any} e 地图返回的对象
	 */
	private handleDragMouseUp = function(e: any) {
		let _this = this.getData('MeasureDistance');
		_this.drag = false;
	}

	/**
	 * 绘制路线
	 * @param {Number} index  序列号
	 * @param {Array}  points 选择的点
	 */
	private draw(index?: number, points?: any[]) {
		index = index ? index : this.index;
		points = points ? points : this.points;
		let _measureData = this.measure['measure-distance-' + index];
		if (points.length > 1 && points[points.length - 2].join('') == points[points.length - 1].join('')) {
			points.pop();
		}
		_measureData.geojson.features = [];
		_measureData.linestring.geometry.coordinates = [];
		_measureData.markers.forEach((marker: any) => {
			marker.remove();
		});
		_measureData.markers = [];
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
							"type": "measure-distance-point",
							"index": index,
							"pIndex": i,
							"coordinate": point.join('')
					}
				};
				_measureData.geojson.features.push(newPoint);
				// 添加marker
				let _elementDiv = document.createElement('div');
				_elementDiv.className = 'measure-label';
				if (i == 0) {
					_elementDiv.innerHTML = '起点';
				} else if (i == points.length - 1 && !this.start) {
					let _lineString: any = {
						"type": "Feature",
						"geometry": {
							"type": "LineString", 
							"coordinates": points 
						}
					}
					let _total = lineDistance(_lineString).toLocaleString();
					_elementDiv.className = 'measure-label total';
					_elementDiv.innerHTML = '总长：<span class="red">'+ _total +'</span> 公里';

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
				} else {
					let _linestring: any =  {
						"type": "Feature",
						"geometry": {
							"type": "LineString", 
							"coordinates": points.filter((sP, sI) => {
								return sI <= i;
							})
						}
					};
					_elementDiv.innerHTML = lineDistance(_linestring).toLocaleString() + ' 公里';
				}
				_measureData.markers.push(new mapboxgl.Marker({
					element: _elementDiv,
					offset: [0, -20]
				}).setLngLat(point).addTo(this.map));
		})
		if (_measureData.geojson.features.length > 1) {
			_measureData.linestring.geometry.coordinates = _measureData.geojson.features.map((point) => {
				return point.geometry.coordinates;
			});
			_measureData.geojson.features.push(_measureData.linestring);
		}

		// 添加节点
		if (!this.start) {
			points.forEach((point, i) => {
				if (i > 0) {
					let _newPoi: [number, number] = [((point[0] - points[i - 1][0]) / 2) + points[i - 1][0], ((point[1] - points[i - 1][1]) / 2) + points[i - 1][1]];
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
		this.map.getSource('measure-distance-geojson-' + index).setData(_measureData.geojson);
		this.setTotal();
	}

	/**
	 * 鼠标移动事件
	 * @param {any} e 地图返回的对象
	 */
	private handleMove = function(e: any) {
		let _this = this.getData('MeasureDistance');
		// 在地图上显示操作的图标
		_this.map.getCanvas().style.cursor = (_this.start) ? 'url("assets/images/ruler.cur") 3 6, crosshair' : 'inherit';
		_this.moveLine(e);
	}

	/**
	 * 添加可移动的线
	 * @param {any} e 地图返回的对象
	 */
	private moveLine = function(e: any) {
		if (this.points.length > 0) {
			this.moveLinestring.geometry.coordinates = [
				this.points[this.points.length - 1],
				[e.lngLat.lng, e.lngLat.lat]
			]
			this.geojsonMoveLine.features = [this.moveLinestring];
			let _linestring: any = {
				"type": "Feature",
				"geometry": {
					"type": "LineString", 
					"coordinates": JSON.parse(JSON.stringify(this.points)) 
				}
			};
			_linestring.geometry.coordinates.push([e.lngLat.lng, e.lngLat.lat]);
			this.setTotal(false, lineDistance(_linestring).toLocaleString() + '公里');
		} else {
			this.geojsonMoveLine.features = [{
				"type": "FeatureCollection",
				"features": []
			}];
			this.setTotal(true);
		};
		this.tipsMarker.setLngLat(e.lngLat);
		this.map.getSource('measure-distance-geojson-move-line').setData(this.geojsonMoveLine);
	}

	/**
	 * 设置总长度
	 * @param {Boolean}  empty  是否为开始
	 * @param {String}   total  自定义长度
	 */
	private setTotal(empty?: boolean, total?: string) {
		if (empty) {
			this.tipsElement.innerHTML = '<span>单击确定起点</span>';
		} else if (!total && this.points.length){
			let _lineString: any = {
				"type": "Feature",
				"geometry": {
					"type": "LineString", 
					"coordinates": this.points 
				}
			}
			let _total = lineDistance(_lineString).toLocaleString() + '公里';
			this.tipsElement.innerHTML = '<h2>' + _total + '</h2><span>单击确定地点，双击结束</span>';
		} else {
			this.tipsElement.innerHTML = '<h2>' + total + '</h2><span>单击确定地点，双击结束</span>';
		}
	} 

	/**
	 * 绑定的停止
	 */
	private handleStop = function () {
		let that = this;
		that.doubleClickZoom.disable();
		let _this = that.getData('MeasureDistance');
		_this.stop();
	}
	/**
	 * 停止
	 */
	private stop() {
		this.start = false;
		this.map.off('click', this.handleClick);
		this.map.off('mousemove', this.handleMove);
		this.destroyMoveLine();
		this.map.getCanvas().style.cursor = 'inherit';
		this.tipsMarker.remove();
		this.draw();
		if (this.stopCallback) {
			this.stopCallback();
		}
		setTimeout(() => {
			this.map.doubleClickZoom.enable();
		}, 100);
	}

	/**
	 * 注销移动线
	 */
	private destroyMoveLine = function () {
		this.map.removeLayer('measure-distance-move-line');
		this.map.removeSource('measure-distance-geojson-move-line');
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
		this.map.setData('MeasureDistance', null);
	}


	/**
	 * 注销
	 * @param {Number} index 要注销的序列号
	 */
	public destroy(index?: number) {
		if (!index) {
			this.map.off('dblclick', this.handleStop);
			this.stop();
			index = this.index;
		}
		this.map.removeLayer('measure-distance-lines-' + index);
		this.map.removeLayer('measure-distance-points-' + index);
		this.map.removeSource('measure-distance-geojson-' + index);
		let _measureData = this.measure['measure-distance-' + index];
		_measureData.markers.forEach((marker: any) => {
			marker.remove();
		});
		_measureData.markers = [];
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
		delete this.measure['measure-distance-' + index];
		if (Object.getOwnPropertyNames(this.measure).length == 0) {
			this.handleCancelClickAndDrag();
		}
	}

}

