define(["dojo/_base/declare", "dojo/_base/lang", "esri/geometry/Point", "esri/geometry/ScreenPoint"], function(e, t, n, i) {
    return e("Echarts3Layer", null, {
        name: "Echarts3Layer",
        _map: null,
        _ec: null,
        _geoCoord: [],
        _option: null,
        _mapOffset: [0, 0],
        _mousewheel: true,
        constructor: function(e, t, chartId) {
            this._map = e;
            var n = document.getElementById(chartId);
            if (n == null) {
                n = this._echartsContainer = document.createElement("div");
            }
            n.setAttribute("id", chartId);
            this._echartsContainer = n;
            n.style.position = "absolute", n.style.height = e.height + "px", n.style.width = e.width + "px";
            n.style.top = "0px", n.style.left = "0px";
            e.container.firstChild.firstChild.style.position = "relative", e.container.firstChild.firstChild.appendChild(n), this._init(e, t)
        },
        _init: function(e, t) {
            var o = this;
            o._map = e, o._ec = t, o.getEchartsContainer = function() {
                return o._echartsContainer
            }, o.getMap = function() {
                return o._map
            }, o.geoCoord2Pixel = function(e) {
                var t = new n(e[0], e[1]),
                    i = o._map.toScreen(t);
                return [i.x, i.y]
            }, o.pixel2GeoCoord = function(e) {
                var t = o._map.toMap(new i(e[0], e[1]));
                return [t.lng, t.lat]
            }, o.initECharts = function() {
                try {
                    o._ec = t.init.apply(o, arguments);
                    o._ec.Geo.prototype.dataToPoint = function(e) {
                        var t = new n(e[0], e[1]),
                            i = o._map.toScreen(t);
                        if (i) {
                            return [i.x, i.y];
                        } else return [0, 0]
                    };
                    o._bindEvent();
                    return o._ec
                } catch (e) {
                    console.log(e);
                }
            }, o.getECharts = function() {
                return o._ec
            }, o.setOption = function(e, t) {
                if (!e.geo) {
                    if (e.grid.length > 0) {
                        e.grid.forEach(function(grid, index) {
                            var s = new n(grid.lon, grid.lat),
                                i = o._map.toScreen(s);
                            if (i&&i.x&&i.y) {
                                grid.x = i.x + 'px', grid.y = i.y + 'px'
                                if (e.series[index].type == 'pie') {
                                    e.series[index].center = [i.x, i.y]
                                }
                            }
                        })
                    } else {
                        var s = new n(e.grid.lon, e.grid.lat),
                            i = o._map.toScreen(s);
                        if (i&&i.x&&i.y) {
                            e.grid.x = i.x + 'px', e.grid.y = i.y + 'px'
                            e.series.forEach(function(g) {
                                if (g.type == 'pie') {
                                    g.center = [i.x, i.y]
                                }
                            })
                        }
                    }
                } else {
                    e.series.forEach(function(s) {
                        if (s.type == 'heatmap') {
                            o._mousewheel = false
                        }
                    })
                }
                o._option = e, o._ec.setOption(e, t)
            }, o._bindEvent = function() {
                o._map.watch("extent", function() {
                    o._resize();
                }), o._map.on("resize", function() {
                    o._resize();
                }), o._map.on("click", function(e) {
                    var oEvent =new MouseEvent("click", {
                        'bubbles': true,
                        'cancelable': true,
                        'view': window,
                        'detail': 0,
                        'screenX': e.native.screenX,
                        'screenY': e.native.screenY,
                        'clientX': e.native.clientX,
                        'clientY': e.native.clientY,
                        'ctrlKey': false,
                        'altKey': false,
                        'shiftKey': false,
                        'metaKey': false,
                        'button': 0,
                    })                           
                    o._ec.getDom().children[0].children[0].dispatchEvent(oEvent)
                });
                if (o._map.type == '3d') {
                    o._ec.getZr().on("mousedown", function(e) {
                        o._lastMousePos = o._map.toMap(new i(e.event.x, e.event.y));
                        o._mapCenterPos = o._map.center;
                        o._ec.getZr().on("mousemove", o._mousemove)
                    }), o._ec.getZr().on("mouseup", function(e) {
                        o._ec.getZr().off("mousemove", o._mousemove)
                    }), o._ec.getZr().on("mousewheel", function(e) {
                        var t = e.wheelDelta,
                            n = o._map;
                        t > 0 ? (n.zoom = n.zoom + 1) : (n.zoom = n.zoom - 1);
                    })
                } else {
                    o._ec.getZr().on("mousewheel", function(e) {
                        if (o._option.geo && o._mousewheel) {
                            var t = e.wheelDelta,
                                n = o._map;
                            t > 0 ? (n.zoom = n.zoom + 1) : (n.zoom = n.zoom - 1);
                        }
                    })
                }
            }, o._resize = function() {
                if (!o._option.geo) {
                    o.setOption(o._option)
                }
                o._ec.resize()
            }, o._mousemove = function(e) {
                var p = o._map.toMap(new i(e.event.x, e.event.y))
                var np = [o._mapCenterPos.longitude - p.longitude + o._lastMousePos.longitude, o._mapCenterPos.latitude - p.latitude + o._lastMousePos.latitude]
                o._map.goTo(np)
            }
        }
    })
});
