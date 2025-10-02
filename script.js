// Initialize map centered on Tampa Bay
var map = L.map('map').setView([27.9, -82.8], 10);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Simulated bloom polygon (edit coordinates to move it)
var bloomArea = L.polygon([
  [27.8, -82.7],
  [27.8, -82.6],
  [27.9, -82.6],
  [27.9, -82.7]
], { color: 'red', fillColor: '#f03', fillOpacity: 0.4 }).addTo(map);
bloomArea.bindPopup("Simulated Bloom Zone – ClearTide Demo");
], {
  color: 'red',
  fillColor: '#f03',
  fillOpacity: 0.4
}).addTo(map);

// Buoy marker (move as needed)
var buoy = L.marker([27.85, -82.65]).addTo(map);
buoy.bindPopup("ClearTide Prototype Buoy");
bloomArea.bindPopup("Simulated Bloom Zone – ClearTide Demo");

