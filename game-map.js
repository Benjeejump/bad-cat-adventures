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
      await script("assets/maplibre/maplibre-gl.js");
      await script("assets/maplibre/leaflet-maplibre-gl.js");
    } catch {
      /* Label-free raster fallback also works without WebGL. */
    }
  }
  function success() {
    ready = true;
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
        !L.maplibreGL ||
        (typeof maplibregl.supported === "function" && !maplibregl.supported())
      )
        throw Error("WebGL unavailable");
      renderer = "game-vector";
      layer = L.maplibreGL({
        style: "./game-map-style.json",
        interactive: false,
        attributionControl: false,
        padding: 0,
        preserveDrawingBuffer: false,
        prefetchZoomDelta: 0,
      });
      layer.addTo(map);
      gl = layer.getMaplibreMap();
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
    }),
    getRenderedStyle: () => gl?.getStyle() || null,
  };
})();
