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
// a variable to nest the geojson layer
let geojson;

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
//add an information box
let info = L.control({
  position: "bottomleft",
});
info.onAdd = () => {
  let div = L.DomUtil.create("div", "info");
  div.innerHTML = '<h3>Population Density</h3><p id="current_feature"></p>';
  return div;
};
info.addTo(map);
// populate the <p> dynamically
let info_p = document.getElementById("current_feature");
// add an event listener func
let highlighted_feature = (e) => {
  e.target.setStyle({
    weight: 5,
    color: "yellow",
    fillOpacity: 0.5,
  });
  e.target.bringToFront();
  info_p.innerHTML = `<h4>County:</h4> ${e.target.feature.properties.name} <br>
    <h4>Population:</h4> ${Math.round(
      e.target.feature.properties.total_pop
    ).toLocaleString()} <br>
    <h4>Pop. Density:</h4> ${e.target.feature.properties.density.toFixed(1)}`;
};
let reset_highlighted_feature = (e) => {
  geojson.resetStyle(e.target);
  info_p.innerHTML = "";
};
fetch("data/county2_2p.geojson")
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    geojson = L.geoJSON(data, {
      style: county_style,
      onEachFeature: (feature, layer) => {
        layer.addEventListener("mouseover", highlighted_feature);
        layer.addEventListener("mouseout", reset_highlighted_feature);
      },
    }).addTo(map);
  });

L.control.layers(basemaps).addTo(map);
