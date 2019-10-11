import Cesium from "cesium/Cesium";
import echarts from "echarts";
import RegisterCoordinateSystem from "./RegisterCoordinateSystem";

export class EchartsLayer {
    constructor(viewer, option) {
        this._viewer = viewer;
        this._isRegistered = false;
        this._chartLayer = this._createLayerContainer();
        this.option = option;
        this._chartLayer.setOption(option);
    }

    _createLayerContainer() {
        var scene = this._viewer.scene;
        var container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = '0px';
        container.style.left = '0px';
        container.style.right = '0px';
        container.style.bottom = '0px';
        container.style.width = scene.canvas.width + "px";
        container.style.height = scene.canvas.height + "px";
        container.style.pointerEvents = "none";
        this._viewer.container.appendChild(container);
        this._echartsContainer = container;
        echarts.glMap = scene;
        this._register();
        return echarts.init(container);
    }
    _register() {
        if (this._isRegistered) return;
        echarts.registerCoordinateSystem("GLMap", new RegisterCoordinateSystem(echarts.glMap));
        echarts.registerAction({
            type: "GLMapRoam",
            event: "GLMapRoam",
            update: "updateLayout"
        }, function(e, t) {});
        echarts.extendComponentModel({
            type: "GLMap",
            getBMap: function() {
                return this.__GLMap
            },
            defaultOption: {
                roam: !1
            }
        });
        echarts.extendComponentView({
            type: "GLMap",
            init: function(echartModel, api) {
                this.api = api, echarts.glMap.postRender.addEventListener(this.moveHandler, this);
            },
            moveHandler: function(e, t) {
                this.api.dispatchAction({
                    type: "GLMapRoam"
                })
            },
            render: function(e, t, i) {},
            dispose: function() {
                echarts.glMap.postRender.removeEventListener(this.moveHandler, this);
            }
        })
        this._isRegistered = true;
    }

    dispose() {
        this._echartsContainer && (this._viewer.container.removeChild(this._echartsContainer), this._echartsContainer = null);
        this._chartLayer && (this._chartLayer.dispose(), this._chartLayer = null);
        this._isRegistered = false;
    }

    destroy() {
        this.dispose();
    }

    updateEchartsLayer(option) {
        this._chartLayer && this._chartLayer.setOption(option);
    }

    getMap() {
        return this._viewer;
    }

    getEchartsLayer() {
        return this._chartLayer;
    }

    show() {
        this._echartsContainer && (this._echartsContainer.style.visibility = "visible");
    }

    hide() {
        this._echartsContainer && (this._echartsContainer.style.visibility = "hidden");
    }

}

Cesium.EchartsLayer = EchartsLayer;