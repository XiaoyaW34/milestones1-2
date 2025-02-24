mapboxgl.accessToken = 'pk.eyJ1IjoiY2VudHJpZnVnZTEiLCJhIjoiY20wdnZuNXJwMDZ2ejJxb2xyZXN1ZWprYSJ9.-ydDpcvn4PY8L_TNR474Sg';

var map = L.map('map', {
  center: [40.7, -74],
  zoom: 11.3,
  minZoom: 10,
  maxZoom: 19
});

L.mapboxGL({
    accessToken: mapboxgl.accessToken,
    style: 'mapbox://styles/centrifuge1/cm33hszqi00z501pac0jl3d6j'
}).addTo(map);

var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    const nameMapping = {
        5: 'Bronx',
        47: 'Brooklyn',
        61: 'Manhattan',
        81: 'Queens',
        85: 'Staten Island'
    };
    const mappedName = props && nameMapping[props.COUNTYFP] ? nameMapping[props.COUNTYFP] : 'Unknown Area';
    this._div.innerHTML = '<h4>Life Expectancy and Tree Density</h4>' +  (props ?
        '<b>' +'Life Expectancy'+' '+ props['Life Expectancy'] + '</b><br />' +'<b>Tree Density'+' '+ props['tree_density']*10e6+' trees per km2' +'</b><br />'+ props.NAMELSAD + '</b><br />'+  mappedName
        : 'Hover over an area');
};

info.addTo(map);

function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });
    layer.bringToFront();
    info.update(layer.feature.properties)
}

function resetHighlight(e) {
    e.target.setStyle({
        weight: 0.3,
        color: "#848484",
        fillOpacity: 0.9
    });
    info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function applyInteractions(layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

function addLayer(dataUrl, styleFunc, interactions = false) {
    fetch(dataUrl)
        .then(response => response.json())
        .then(data => {
            const layer = L.geoJson(data, {
                style: styleFunc,
                onEachFeature: interactions ? function (feature, layer) {
                    applyInteractions(layer);
                } : null
            }).addTo(map);
        });
}

function getColor1(d) {
    return d === 11 ? '#d7191c' :
          d === 12 ? '#e13e2d' :
          d === 13  ? '#ea643f' :
          d === 14  ? '#f48950' :
          d === 21  ? '#fdae61' :
          d === 22  ? '#fec279' :
          d === 23 ? '#fed790' :
          d === 24 ? '#ffeba8' :
          d === 31 ? '#ffffbf' :
          d === 32 ? '#eaf7b8' :
          d === 33 ? '#d5eeb2' :
          d === 34 ? '#c0e6ab' :
          d === 41 ? '#abdda4' :
          d === 42 ? '#8bc7aa' :
          d === 43 ? '#6bb0af' :
          d === 44 ? '#4b9ab4' :
                    '#ffffff';
}

addLayer('data/newyorkcity.geojson', function (feature) {
    const type = feature.properties['life+treedensity'];
    return {
        color: "#848484",
        weight: 0.5,
        fillColor: getColor1(type),
        fillOpacity: 0.9
    };
}, true);

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

  var container = L.DomUtil.create('div', 'info legend');

  var div_type = L.DomUtil.create('div', 'legend-section', container),
      typeCodes=[11, 12, 13, 14, 21, 22, 23, 24, 31, 32, 33, 34, 41, 42, 43, 44]
      typeLabels = ['Low life expectancy / Low tree density', 'Low L.E. / Moderate T.D.', 'Low L.E. / High T.D.', 'Low L.E. / Very high T.D.', 'Moderate L.E. / Low T.D.', 'Moderate L.E. / Moderate T.D.', 'Moderate L.E. / High T.D.', 'Moderate L.E. / Very high T.D.','High L.E. / Low T.D.','High L.E. / Moderate T.D.','High L.E. / High T.D.','High L.E. / Very high T.D.','Very high L.E. / Low T.D.','Very high L.E. / Moderate T.D.','Very high L.E. / High T.D.','Very high L.E. / Very high T.D.'];
      
  div_type.innerHTML = '<h4>Life Expectancy and Building Density</h4>' ;
  
  for (var i = 0; i < typeLabels.length; i++) {
      div_type.innerHTML +=
          '<i style="background:' + getColor1(typeCodes[i]) + '"></i> ' + 
          typeLabels[i] + '<br>';
  }
  
  return container;
};

legend.addTo(map);
