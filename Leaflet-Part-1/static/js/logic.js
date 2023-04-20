// Store queryURL
const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// GET request to the url
d3.json(url).then(function(data) {
    createFeatures(data.features);
  });

function createFeatures(earthquakeData) {

    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>Where: ${feature.properties.place}</h3><hr><p>Time: ${new Date(feature.properties.time)}</p><hr><p>Magnitude: ${feature.properties.mag}<p>Depth: ${feature.geometry.coordinates[2]}km</p>`);
    }

   // Create a GeoJSON layer on the earthquakeData object that has the features array
   function createCircleMarker(feature, latlong) {
      let options = {
       radius:feature.properties.mag*5,
       fillColor: chooseColor(feature.properties.mag),
       color: chooseColor(feature.properties.mag),
       weight: 1,
       opacity: 0.8,
       fillOpacity: 0.35
      } 
      return L.circleMarker(latlong,options);
   }

 let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: createCircleMarker
   });

   // Send the earthquakes layer to the createMap function
   createMap(earthquakes);
}

  // Color circles based on mag
  function chooseColor(mag) {
      switch(true) {
          case(1.0 <= mag && mag <= 2.5):
              return "#0071BC"; // Strong blue
          case (2.5 <= mag && mag <=4.0):
              return "#35BC00";
          case (4.0 <= mag && mag <=5.5):
              return "#BCBC00";
          case (5.5 <= mag && mag <= 8.0):
              return "#BC3500";
          case (8.0 <= mag && mag <=20.0):
              return "#BC0000";
          default:
              return "#E2FFAE";
      }
  }

  let legend = L.control({position: 'bottomright'});

  legend.onAdd = function() {
      let div = L.DomUtil.create('div', 'info legend');
      let grades = [1.0, 2.5, 4.0, 5.5, 8.0];
      let labels = [];
      let legendInfo = "<h4>Magnitude</h4>";

      div.innerHTML = legendInfo

      for (i = 0; i < grades.length; i++) {
            labels.push('<ul style="background-color:' + chooseColor(grades[i] + 1) + '"> <span>' + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '' : '+') + '</span></ul>');
      }

      div.innerHTML += "<ul>" + labels.join("") + "</ul>";
  
      return div;
  };


  // Create map
  function createMap(earthquakes) {

    // Define layers
    let googleSatellitemap = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
      maxZoom: 10,
      subdomains:['mt0','mt1','mt2','mt3'],
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    let streetlayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // Define a baseMaps object to hold our base layers
    let baseMaps = {
      "Google Satellite Map": googleSatellitemap,
      "Street Layer": streetlayer
    };

    // Create overlay object to hold our overlay layer
    let overlayMaps = {
      "Earthquakes": earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    let myMap = L.map("map", {
      center: [39.8282, -98.5795],
      zoom: 5,
      layers: [streetlayer, googleSatellitemap, earthquakes]
    });

    // Add layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);
    legend.addTo(myMap);
  }