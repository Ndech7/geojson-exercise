let map = L.map("map").setView([38.8226, -102.4805], 5);

//add a base tile layers
let osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy: OpenStreetMap",
}).addTo(map);

let cartoDB = L.tileLayer(
  "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}.png",
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attribution/">CartoDB</a>',
    subdomains: "abcd",
    maxZoom: 19,
  }
);

let esriImagery = L.tileLayer(
  "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution: `Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, 
	IGN, IGP, UPR-EGP, and the GIS User Community`,
  }
);

let basemaps = {
  OSM: osm,
  "Carto DB": cartoDB,
  "ESRI Imagery": esriImagery,
};

// fetch the data
//determine quantile breaks(using QGIS)
let breaks = [0, 3.8, 11.4, 21.9, 52.7, Infinity];
//define a color scheme for the different break intervals
let colors = ["#edf8fb", "#b3cde3", "#8c96c6", "#8856a7", "#810f7c"];
//define a for loop to iterate through the color scheme
let county_color = (d) => {
  for (let i = 0; i < breaks.length; i++) {
    if (d > breaks[i] && d < breaks[i + 1]) {
      return colors[i];
    }
  }
};
//define a func to set the styling of the data
let county_style = (feature) => {
  return {
    fillColor: county_color(feature.properties.density),
    color: "black",
    opacity: 1,
    fillOpacity: 0.7,
    weight: 0.5,
  };
};
fetch("data/county2_2p.geojson")
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    L.geoJSON(data, { style: county_style }).addTo(map);
  });

L.control.layers(basemaps).addTo(map);
