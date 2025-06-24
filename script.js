// Layer peta dasar
const positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; CartoDB'
});

const darkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; CartoDB'
});

const esri = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri'
});

// Layer tile klasifikasi GitHub
const tilesOutputLayer = L.tileLayer('https://raw.githubusercontent.com/ridhoarazzak/Klasifikasi_peta_sangir/main/tiles_output/{z}/{x}/{y}.png', {
  attribution: '&copy; Klasifikasi Sangir'
});

// Layer dari Earth Engine
const geeTileLayer = L.tileLayer('https://earthengine.googleapis.com/v1/projects/ee-mrgridhoarazzak/maps/0ac1e1d72a39312b3aa182231dfacd48-6a4d05cdaed7703fac43bb8a1feec249/tiles/{z}/{x}/{y}', {
  attribution: '&copy; Google Earth Engine',
  opacity: 0.6
});

const map = L.map('map', {
  center: [-1.5269, 101.3002],
  zoom: 12,
  layers: [positron]
});

// Base maps
const baseMaps = {
  "Positron (Terang)": positron,
  "Dark Matter (Gelap)": darkMatter,
  "ESRI Satelit": esri
};

// Overlay layers
const overlayMaps = {
  "Tiles Klasifikasi Sangir": tilesOutputLayer,
  "Tile Earth Engine (Konservasi)": geeTileLayer
};

// Kontrol layer toggle
L.control.layers(baseMaps, overlayMaps).addTo(map);

// Warna dan nama kelas
const classColors = {
  0: "#006400",
  1: "#FFD700",
  2: "#FF0000",
  3: "#0000FF"
};

const classNames = {
  0: "Hutan",
  1: "Pertanian",
  2: "Pemukiman",
  3: "Air / Sungai"
};

function style(feature) {
  const kelasNum = feature.properties.class;
  return {
    fillColor: classColors[kelasNum] || "#cccccc",
    color: "white",
    weight: 1,
    fillOpacity: 0.7
  };
}

function onEachFeature(feature, layer) {
  const props = feature.properties;
  let areaHa = props.area_ha;
  if (!areaHa) {
    areaHa = turf.area(feature) / 10000;
  }
  const kelasName = classNames[props.class] || "Tidak diketahui";
  layer.bindPopup(
    `<strong>Kelas:</strong> ${kelasName}<br>Luas: ${areaHa.toFixed(2)} ha`
  );
}

// Load GeoJSON
fetch('https://raw.githubusercontent.com/ridhoarazzak/Klasifikasi_peta_sangir/main/simplified_classified_all_classes_sangir_geojson.geojson')
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      style: style,
      onEachFeature: onEachFeature
    }).addTo(map);
  })
  .catch(err => console.error('Error loading GeoJSON:', err));

// Legend
const legend = L.control({ position: "bottomright" });

legend.onAdd = function () {
  const div = L.DomUtil.create("div", "legend");
  for (let key in classColors) {
    div.innerHTML += `<i style="background:${classColors[key]}"></i> ${classNames[key]}<br>`;
  }
  return div;
};

legend.addTo(map);
