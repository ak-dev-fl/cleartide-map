// Initialize map centered on Tampa Bay
var map = L.map('map').setView([27.9, -82.8], 10);

// Base map layer (OSM tiles)
var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// =======================
// 1. Bloom Zones Layer (with severity)
// =======================
var bloomLayer = L.layerGroup();

// Example polygons with severity property
var blooms = [
  {
    coords: [
      [27.8, -82.7],
      [27.8, -82.6],
      [27.9, -82.6],
      [27.9, -82.7]
    ],
    severity: "high"
  },
  {
    coords: [
      [27.85, -82.75],
      [27.85, -82.70],
      [27.90, -82.70],
      [27.90, -82.75]
    ],
    severity: "moderate"
  }
];

// Color ramp
function getSeverityColor(sev) {
  switch (sev) {
    case "low": return "#2ECC71";      // green
    case "moderate": return "#F1C40F"; // yellow
    case "high": return "#E74C3C";     // red
    default: return "#95A5A6";         // grey fallback
  }
}

// Add polygons
blooms.forEach(b => {
  var poly = L.polygon(b.coords, {
    color: getSeverityColor(b.severity),
    fillColor: getSeverityColor(b.severity),
    fillOpacity: 0.4
  }).addTo(bloomLayer);

  poly.bindPopup(`Bloom Zone<br>Severity: ${b.severity}`);
});

// =======================
// 2. Buoy Layer with live data
// =======================

// Custom buoy icon
var buoyIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/616/616408.png',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28]
});

var buoyLayer = L.layerGroup();

Promise.all([
  fetch('data/buoys.geojson').then(r => r.json()),
  fetch('data/buoy_readings.json').then(r => r.json())
]).then(([geo, readings]) => {
  let latestTimestamp = null;

  L.geoJSON(geo, {
    pointToLayer: function (feature, latlng) {
      return L.marker(latlng, { icon: buoyIcon });
    },
    onEachFeature: function (feature, layer) {
      const id = feature.properties.id;
      const data = readings[id] || {};

      // track latest update
      if (data.last_update) {
        const dt = new Date(data.last_update);
        if (!latestTimestamp || dt > latestTimestamp) {
          latestTimestamp = dt;
        }
      }

      const popup = `
        <b>${data.name || feature.properties.name || "Buoy"}</b><br>
        Status: ${data.status || 'n/a'}<br>
        Temp: ${data.temp_c ?? '–'} °C<br>
        Chlorophyll-a: ${data.chl_a ?? '–'} µg/L<br>
        Turbidity: ${data.turbidity ?? '–'} NTU<br>
        Updated: ${data.last_update || 'n/a'}
      `;
      layer.bindPopup(popup);
    }
  }).addTo(buoyLayer);

  // Add last updated overlay
  if (latestTimestamp) {
    const div = L.control({ position: 'bottomleft' });
    div.onAdd = function () {
      const el = L.DomUtil.create('div', 'update-time');
      el.style.background = "rgba(255,255,255,0.8)";
      el.style.padding = "6px 10px";
      el.style.fontSize = "12px";
      el.style.borderRadius = "6px";
      el.style.boxShadow = "0 1px 4px rgba(0,0,0,0.3)";
      el.innerHTML = `Last Updated:<br><b>${latestTimestamp.toISOString()}</b>`;
      return el;
    };
    div.addTo(map);
  }
});

// =======================
// 3. Layer Control
// =======================
var baseMaps = {
  "OpenStreetMap": osm
};

var overlayMaps = {
  "Bloom Zones": bloomLayer,
  "Buoys": buoyLayer
};

L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);

// Add layers by default
bloomLayer.addTo(map);
buoyLayer.addTo(map);

// =======================
// 4. Legend
// =======================
var legend = L.control({ position: "bottomright" });

legend.onAdd = function () {
  var div = L.DomUtil.create("div", "legend");
  div.style.background = "rgba(255,255,255,0.9)";
  div.style.padding = "8px";
  div.style.fontSize = "12px";
  div.style.borderRadius = "6px";
  div.style.boxShadow = "0 1px 4px rgba(0,0,0,0.3)";

  div.innerHTML = `
    <b>Legend</b><br>
    <i style="background:#2ECC71;width:12px;height:12px;display:inline-block;margin-right:4px;"></i> Low Bloom<br>
    <i style="background:#F1C40F;width:12px;height:12px;display:inline-block;margin-right:4px;"></i> Moderate Bloom<br>
    <i style="background:#E74C3C;width:12px;height:12px;display:inline-block;margin-right:4px;"></i> High Bloom<br>
    <img src="https://cdn-icons-png.flaticon.com/512/616/616408.png" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;"> Buoy
  `;
  return div;
};

legend.addTo(map);
