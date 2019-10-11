import echarts from "echarts";
import Cesium from "cesium/Cesium";

class RegisterCoordinateSystem {
    dimensions = ["lng", "lat"]
    radians = Cesium.Math.toRadians(80)
    constructor(glMap) {
        this._GLMap = glMap;
        this._mapOffset = [0, 0];
        this.dimensions = ['lng', 'lat'];
        //this._api = api;
    }

    setMapOffset(mapOffset) {
        this._mapOffset = mapOffset;
    }

    getMap() {
        return this._GLMap;
    }

    fixLat(lat) {
        return lat >= 90 ? 89.99999999999999 : lat <= -90 ? -89.99999999999999 : lat
    }

    dataToPoint(coords) {
        let lonlat = [99999, 99999];
        coords[1] = this.fixLat(coords[1]);
        let position = Cesium.Cartesian3.fromDegrees(coords[0], coords[1]);
        if (!position) return lonlat;
        let coordinates = this._GLMap.cartesianToCanvasCoordinates(position);
        if (!coordinates) return lonlat;
        if (this._GLMap.mode === Cesium.SceneMode.SCENE3D) {
            if (Cesium.Cartesian3.angleBetween(this._GLMap.camera.position, position) > this.radians) return !1;
        }
        return [coordinates.x - this._mapOffset[0], coordinates.y - this._mapOffset[1]];
    }

    pointToData(pixel) {
        let mapOffset = this._mapOffset,
            coords = this._bmap.project([pixel[0] + pixel[0], pixel[1] + pixel[1]]);
        return [coords.lng, coords.lat];
    }

    getViewRect() {
        let api = this._api;
        return new echarts.graphic.BoundingRect(0, 0, api.getWidth(), api.getHeight())
    }

    getRoamTransform() {
        return echarts.matrix.create();
    }

    create(echartModel, api) {
        this._api = api;
        let registerCoordinateSystem;
        echartModel.eachComponent("GLMap", function(seriesModel) {
            let painter = api.getZr().painter;
            if (painter) {
                //let glMap = (api.getViewportRoot(), echarts.glMap);
                let glMap = echarts.glMap;
                registerCoordinateSystem = new RegisterCoordinateSystem(glMap, api);
                registerCoordinateSystem.setMapOffset(seriesModel.__mapOffset || [0, 0]);
                seriesModel.coordinateSystem = registerCoordinateSystem;
            }
        })

        echartModel.eachSeries(function(series) {
            "GLMap" === series.get("coordinateSystem") && (series.coordinateSystem = registerCoordinateSystem);
        })
    }

}

export default RegisterCoordinateSystem;