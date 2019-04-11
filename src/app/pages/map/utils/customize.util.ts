import { point, distance, lineString } from 'turf';
import { nearestPointOnLine } from '@turf/nearest-point-on-line';
/**
 * 自定义交互
 * @param {Object} map mapbox地图对象
 */
export class Customize {

  // 添加自定义鼠标经过
  private customizeGeojson: any = {
    'type': 'FeatureCollection',
    'features': []
  };

  private customizeActiveGeojson: any = {
    'type': 'FeatureCollection',
    'features': []
  };
  private customizeMoveGeojson = {
    'type': 'FeatureCollection',
    'features': []
  };

  private customizeData = {};

  private customizeMoveStart = false;

  // 捕捉的数据
  private captureData = [];

  // 捕捉的类型
  private captureType = '';

  constructor(
    private map: any
  ) {
    this.init();
  }

  private init() {
		this.map.on('load', () => {
			this.map.addSource('customize-geojson', {
				'type': 'geojson',
				'data': this.customizeGeojson
			});
			this.map.addLayer({
				id: 'customize-fill',
				type: 'fill',
				source: 'customize-geojson',
				paint: {
						'fill-color': '#ffff00',
						'fill-opacity': .4
				},
				filter: ['in', '$type', 'Polygon']
			});

			this.map.addLayer({
				id: 'customize-border',
				type: 'line',
				source: 'customize-geojson',
				layout: {
						'line-cap': 'round',
						'line-join': 'round'
				},
				paint: {
						'line-color': '#FF89FF',
						'line-width': 1.5,
						'line-opacity': 1
				},
				filter: ['in', '$type', 'Polygon']
			});

			this.map.addLayer({
				id: 'customize-line',
				type: 'line',
				source: 'customize-geojson',
				layout: {
						'line-cap': 'round',
						'line-join': 'round'
				},
				paint: {
						'line-color': '#0089FF',
						'line-width': 4,
						'line-opacity': .7
				},
				filter: ['in', '$type', 'LineString']
			});
			this.map.addLayer({
				id: 'customize-point',
				type: 'circle',
				source: 'customize-geojson',
				paint: {
						'circle-radius': 6,
						'circle-color': '#0089FF',
						'circle-stroke-width': 2,
						'circle-stroke-color': '#ffffff'
				},
				filter: ['in', '$type', 'Point']
			});
		
		
			this.map.addSource('customize-active-geojson', {
				'type': 'geojson',
				'data': this.customizeActiveGeojson
			});
			this.map.addLayer({
				id: 'customize-active-fill',
				type: 'fill',
				source: 'customize-active-geojson',
				paint: {
						'fill-color': '#FC641C',
						'fill-opacity': .8
				},
				filter: ['in', '$type', 'Polygon']
			});
			this.map.addLayer({
				id: 'customize-active-line',
				type: 'line',
				source: 'customize-active-geojson',
				layout: {
						'line-cap': 'round',
						'line-join': 'round'
				},
				paint: {
						'line-color': '#FC641C',
						'line-width': 4,
						'line-opacity': .8
				},
				filter: ['in', '$type', 'LineString']
			});
			this.map.addLayer({
				id: 'customize-active-point',
				type: 'circle',
				source: 'customize-active-geojson',
				paint: {
						'circle-radius': 6,
						'circle-color': '#FC641C',
						'circle-stroke-width': 2,
						'circle-stroke-color': '#ffffff'
				},
				filter: ['in', '$type', 'Point']
			});
		
			this.map.on('mousemove', (e) => {
				let features = this.map.queryRenderedFeatures(e.point, {
					layers: [
						'customize-fill',
						'customize-line',
						'customize-point',
					]
				});
				if (features.length) {
					// this.customizeActiveGeojson.features.push(this.customizeData[features[0].properties.id]);
					let tfeature = this.customizeData[features[0].properties.id];
					this.captureType = tfeature.geometry.type;
					switch(tfeature.geometry.type) {
						case 'LineString':
						this.captureData = tfeature.geometry.coordinates;
						break;

						case 'Polygon':
						this.captureData = tfeature.geometry.coordinates[0];
						break;

						default:
						this.captureData = tfeature.geometry.coordinates;
						break;
					}
				}
				// this.map.getSource('customize-active-geojson').setData(this.customizeActiveGeojson);
				if (this.customizeMoveStart) {
					// this.customizeActiveGeojson.features = [];
					this.customizeMoveGeojson.features = [{
						'type': 'Feature',
						'geometry': {
								'type': 'Point',
								'coordinates': [e.lngLat.lng, e.lngLat.lat]
						}
					}];
					this.map.setPaintProperty('customize-move-point', 'circle-color', '#216F0A');
					let _zoom = this.map.getZoom();
					if (this.captureData.length) {
						if (this.captureType === 'Point') {
							let from = turf.point([e.lngLat.lng, e.lngLat.lat]);
							let to = turf.point(this.captureData);
							if (turf.distance(from, to) < 655.36 / Math.pow(2, _zoom - 1)) {
								this.customizeMoveGeojson.features = [
									{
										'type': 'Feature',
										'geometry': {
												'type': 'Point',
												'coordinates': this.captureData
										}
									}
								];
								this.map.setPaintProperty('customize-move-point', 'circle-color', '#8BFC6C');
							}
						} else {
							let line: any = turf.lineString(this.captureData);
							let pt: any = turf.point([e.lngLat.lng, e.lngLat.lat]);
							let snapped = (turf as any).nearestPointOnLine(line, pt);
							if (snapped.properties.dist < 655.36 / Math.pow(2, _zoom - 1)) {
								this.customizeMoveGeojson.features = [snapped];
								this.map.setPaintProperty('customize-move-point', 'circle-color', '#8BFC6C');
							}
						}
					}
					this.map.getSource('customize-move-geojson').setData(this.customizeMoveGeojson);
				}
			})
		})
	}

	/**
	 * 添加feature数据
	 */
	public addCustomizeFeature(feature) {
		this.customizeGeojson.features.push(feature);
		this.customizeData[feature.properties.id] = feature;
		this.map.getSource('customize-geojson').setData(this.customizeGeojson);
	}

	/**
	 * 添加feature数据
	 */
	public removeCustomizeFeature(feature) {
		let _id = feature.properties.id;
		this.customizeGeojson.features = this.customizeGeojson.features.filter((feature) => {
			return feature.properties.id != _id;
		})
		delete this.customizeData[_id];
		this.map.getSource('customize-geojson').setData(this.customizeGeojson);
	}
	
	/**
	 * 开启捕捉功能
	 */
	public addCustomizeMove() {
		if (!this.customizeMoveStart) {
			this.customizeMoveStart = true;
			this.map.addSource('customize-move-geojson', {
				'type': 'geojson',
				'data': this.customizeMoveGeojson
			});
			this.map.addLayer({
				id: 'customize-move-point',
				type: 'circle',
				source: 'customize-move-geojson',
				paint: {
						'circle-radius': 6,
						'circle-color': '#216F0A',
						'circle-stroke-width': 2,
						'circle-stroke-color': '#ffffff'
				},
				filter: ['in', '$type', 'Point']
			});
		}
	}

	/**
	 * 关闭捕捉功能
	 */
	public removeCustomizeMove() {
		if (this.customizeMoveStart) {
			this.customizeMoveStart = false;
			this.map.removeLayer('customize-move-point');
			this.map.removeSource('customize-move-geojson');
		}
	}

	/**
	 * 获取捕捉的点坐标
	 */
	public getPoint() {
		return this.customizeMoveGeojson.features.length ? this.customizeMoveGeojson.features[0].geometry.coordinates : []
	}

	/**
	 * 获取捕捉的点坐标
	 */
	public getCapture() {
		return {
			captureData: this.captureData,
			captureType: this.captureType
		}
	}
}
