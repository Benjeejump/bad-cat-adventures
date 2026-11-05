/* Real road geometry, drawn as a quiet game board. No symbols, POIs or building layer. */
"use strict";
(() => {
  let leafletMap,
    layer,
    gl,
    callbacks,
    started = false,
    renderer = "not-started",
    ready = false,
    timer;
  const attribution =
    '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> · <a href="https://openfreemap.org/" target="_blank" rel="noopener">OpenFreeMap</a>';
  function script(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.append(s);
    });
  }
  async function prepare() {
    try {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = "assets/maplibre/maplibre-gl.css";
      document.head.append(css);
      await script("assets/leaflet/leaflet-rotate.js");
      await script("assets/maplibre/maplibre-gl.js");
    } catch {
      /* Label-free raster fallback also works without WebGL. */
    }
  }
  function applyPalette() {
    const night = window.badCatTheme?.isNight();
    if (renderer === "simple-raster") {
      document
        .querySelectorAll(".simple-road-tiles")
        .forEach((node) => node.classList.toggle("night-road-tiles", !!night));
      return;
    }
    if (!gl?.isStyleLoaded()) return;
    const paints = night
      ? {
          "soft-ground": ["background-color", "#183449"],
          parks: ["fill-color", "#214c4a"],
          water: ["fill-color", "#175b7d"],
          "road-edges": ["line-color", "#102431"],
          "friendly-roads": ["line-color", "#a8bac0"],
          "major-road-centres": ["line-color", "#dcaf63"],
        }
      : {
          "soft-ground": ["background-color", "#a6c88b"],
          parks: ["fill-color", "#6da56f"],
          water: ["fill-color", "#328eb5"],
          "road-edges": ["line-color", "#667c65"],
          "friendly-roads": ["line-color", "#f4d495"],
          "major-road-centres": ["line-color", "#d18c46"],
        };
    for (const [id, [property, color]] of Object.entries(paints))
      if (gl.getLayer(id)) gl.setPaintProperty(id, property, color);
  }
  window.addEventListener("bad-cat-theme", applyPalette);
  function success() {
    ready = true;
    applyPalette();
    clearTimeout(timer);
    callbacks.ready();
  }
  function raster() {
    if (renderer === "simple-raster") return;
    if (layer) {
      try {
        leafletMap.removeLayer(layer);
      } catch {}
    }
    renderer = "simple-raster";
    ready = false;
    leafletMap.attributionControl.addAttribution(
      '© <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>',
    );
    layer = L.tileLayer(
      "https://basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
      {
        maxZoom: 21,
        maxNativeZoom: 20,
        className: "simple-road-tiles",
        attribution: "",
      },
    ).addTo(leafletMap);
    layer.on("tileload", success);
    layer.on("tileerror", () => {
      if (!ready)
        callbacks.unavailable(
          "The simplified road map is offline. Showing imaginary terrain; GPS and games still work.",
        );
    });
  }
  function mount(map, hooks) {
    if (started) return;
    started = true;
    leafletMap = map;
    callbacks = hooks;
    map.attributionControl.addAttribution(attribution);
    try {
      if (
        !window.maplibregl ||
        (typeof maplibregl.supported === "function" && !maplibregl.supported())
      )
        throw Error("WebGL unavailable");
      renderer = "game-vector";
      // Keep the native renderer in screen coordinates. Leaflet rotates its
      // geographic overlays; MapLibre rotates roads with the same bearing.
      const Roads = L.Layer.extend({
        onAdd(map) {
          this.node = L.DomUtil.create(
            "div",
            "heading-road-canvas",
            map.getContainer(),
          );
          Object.assign(this.node.style, {
            position: "absolute",
            inset: "0",
            zIndex: "100",
            pointerEvents: "none",
          });
          const center = map.getCenter();
          gl = new maplibregl.Map({
            container: this.node,
            style: "./game-map-style.json",
            interactive: false,
            attributionControl: false,
            center: [center.lng, center.lat],
            zoom: map.getZoom() - 1,
            bearing: -(map.getBearing?.() || 0),
            prefetchZoomDelta: 0,
          });
        },
        getEvents() {
          return {
            move: this.sync,
            zoom: this.sync,
            resize: this.sync,
            rotate: this.sync,
          };
        },
        sync() {
          if (!gl) return;
          const center = this._map.getCenter();
          gl.resize();
          gl.jumpTo({
            center: [center.lng, center.lat],
            zoom: this._map.getZoom() - 1,
            bearing: -(this._map.getBearing?.() || 0),
          });
        },
        onRemove() {
          gl?.remove();
          gl = null;
          this.node.remove();
        },
      });
      layer = new Roads().addTo(map);
      gl.on("style.load", applyPalette);
      gl.on("sourcedata", (e) => {
        if (e.sourceId === "terrain" && e.isSourceLoaded) success();
      });
      gl.on("error", () => {
        if (!ready) raster();
      });
    } catch {
      raster();
    }
    timer = setTimeout(() => {
      if (!ready) {
        if (renderer === "game-vector") raster();
        callbacks.unavailable(
          "Roads need a connection. GPS is still live; the coloured background is imaginary.",
        );
      }
    }, 10000);
  }
  function retry() {
    if (!started) return;
    if (renderer === "simple-raster") layer?.redraw();
    else if (gl) gl.triggerRepaint();
  }
  window.badCatGameMap = {
    prepare,
    mount,
    retry,
    diagnostics: () => ({
      started,
      renderer,
      ready,
      labels: false,
      buildings: renderer === "simple-raster",
      headingUp: true,
      bearing: ((-(leafletMap?.getBearing?.() || 0) % 360) + 360) % 360,
      roadBearing: gl ? ((gl.getBearing() % 360) + 360) % 360 : null,
    }),
    getRenderedStyle: () => gl?.getStyle() || null,
  };
})();
