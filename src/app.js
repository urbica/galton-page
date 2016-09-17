
require("!style!css!./css/style.css");

var d3 = require('d3');
var turf = require('turf');

console.log('hello');


var lang = "en",
    dlang = navigator.language || navigator.userLanguage;
  
if(dlang=="ru" || dlang=="ru-RU") lang = "ru";

var cities = [
  { id: "amsterdam_netherlands", center: [4.893446,52.372732], ru: "Амстердам", en: "Amsterdam" },
  { id: "beijing_china", center: [116.387548,39.908373], ru: "Пекин", en: "Beijin" },
  { id: "berlin_germany", center: [13.385706,52.516879], ru: "Берлин", en: "Berlin" },
  { id: "madrid_spain", center: [-3.672785,40.423885], ru: "Мадрид", en: "Madrid" },
  { id: "moscow_russia", center: [37.617015, 55.750931], ru: "Москва", en: "Moscow" },
  { id: "london_england", center: [-0.098487,51.511382], ru: "Лондон", en: "London" },
  { id: "new-york_new-york", center: [-73.966473,40.778134], ru: "Нью-Йорк", en: "New York" },
  { id: "paris_france", center: [2.293487,48.858881], ru: "Париж", en: "Paris" },
  { id: "san-francisco_california", center: [-122.409729,37.808164], ru: "Сан-Франциско", en: "San Francisco" }
];

var menuItems = [
  { id: 'about-btn', ref: 'about', ru: 'О&nbsp;проекте', en: 'About' },
  { id: 'cities-btn', ref: 'cities', ru: 'Города', en: 'Cities' }
];

maps = [
  { id: 'map-mapbox', label: 'Mapbox GL JS'}
];


var isAbout = true,
    currentMode = 'foot',
    currentCity = 'moscow_russia',
    currentPage = 'about',
    galtonUrl = 'http://galton.urbica.co/',
    intervals = '&intervals[]=10&intervals[]=20';
  

//blocks
var citiesList = d3.select("#cities-list"),
    menu = d3.select('#menu'),
    selectedCity = d3.select("#selectedCity"),
    modeFoot = d3.select("#mode-foot"),
    modeCar = d3.select("#mode-car"),
    progress = d3.select("#progress");


    function setLang(l) {
      console.log(l);
      if(l == 'ru') {
        d3.selectAll('.lang-ru').style('display', 'block');
        d3.selectAll('.lang-en').style('display', 'none');
      } else {
        d3.selectAll('.lang-en').style('display', 'block');
        d3.selectAll('.lang-ru').style('display', 'none');
      }
    }

    var mobileContentShown = false;

//building cities menu
cities.forEach(function(c) {
  var cItem = citiesList.append("div").attr("class", "city");
  cItem.append("span").attr("class", "lang-en").text(c.en);
  cItem.append("span").attr("class", "lang-ru").text(c.ru);
  cItem.on('click', function() {
    setCity(c.id);
  })
});

//creating menu
menuItems.forEach(function(m) {
  var item = menu.append('div').attr('class', (currentPage === m.ref) ? 'menu-item-selected' : 'menu-item');
  item.append('span').attr('class', 'lang-ru').html(m.ru);
  item.append('span').attr('class', 'lang-en').html(m.en);  
  item.on('click', function() {
    setPage(m.ref);
  });
});

function setCity(id) {
  selectedCity.text('');
  cities.forEach(function(c){
    if(c.id == id) {
      selectedCity.append('span').attr("class", "lang-en").text(c.en);
      selectedCity.append('span').attr("class", "lang-ru").text(c.ru);
      map.setCenter(c.center);
      currentCity = c.id;
      getGalton(c.center, currentMode, c.id);
    }
  });
  setLang(lang);
}

function setPage(ref) {
  console.log(ref);

  menuItems.forEach(function(m) {
    d3.select('#'+m.id).attr('class', (ref === m.ref) ? 'menu-item-selected' : 'menu-item');
    d3.select('#'+m.ref).style('display', (m.ref === ref) ? 'block' : 'none');
  });
  currentPage = ref;

}

  setPage(currentPage)
  setLang(lang);

var start = [37.617015, 55.750931],
    startPoint = turf.featureCollection([turf.point(start)]),
    isDragging,
    isCursorOverPoint,
    loadedData,
    args = location.search.replace(/^\?/,'').split('&').reduce(function(o, param){ var keyvalue=param.split('='); o[keyvalue[0]] = keyvalue[1]; return o; }, {});

modeFoot.on('click', function() { changeMode('foot'); });
modeCar.on('click', function() { changeMode('car'); });

function changeMode(m) {
  console.log(m);
  if(m == 'foot') {
    modeFoot.attr('class', 'mode-selected');
    modeCar.attr('class', 'mode');
    getGalton(startPoint.features[0].geometry.coordinates, 'foot', currentCity);
  } else {
    modeFoot.attr('class', 'mode');
    modeCar.attr('class', 'mode-selected');
    getGalton(startPoint.features[0].geometry.coordinates, 'car', currentCity);
  }
}

mapboxgl.accessToken = 'pk.eyJ1IjoidXJiaWNhIiwiYSI6ImNpbnlvMXl4bDAwc293ZGtsZjc3cmV1MWYifQ.ejYUpie2LkrVs_dmQct1jA';

var map = new mapboxgl.Map({
  container: "map-mapbox",
  style: "mapbox://styles/urbica/cirlzq8g90016gxlz0kijgiwf",
  center: start,
  zoom: 13
  }),
  canvas = map.getCanvasContainer();

  map.on('click', function(e) {

  	console.log('click'); 
  });


//start
setLang(lang);

setCity('moscow');




var layers = [
  { time: 20, color: '#0af', opacity: 0.4 },
  { time: 10, color: '#0af', opacity: 0.6 }
];


function mouseDown(e) {
    if (!isCursorOverPoint) return;

    isDragging = true;

    // Set a cursor indicator
    canvas.style.cursor = 'grab';

    // Mouse events
    map.on('mousemove', onMove);
    map.on('mouseup', onUp);
}

function onMove(e) {
    if (!isDragging) return;
    var coords = e.lngLat;
    // Set a UI indicator for dragging.
    canvas.style.cursor = 'grabbing';

    // Update the Point feature in `geojson` coordinates
    // and call setData to the source layer `point` on it.
    startPoint.features[0].geometry.coordinates = [coords.lng, coords.lat];
    map.getSource('start').setData(startPoint);
}

function onUp(e) {
    if (!isDragging) return;
    var coords = e.lngLat;
    canvas.style.cursor = '';
    isDragging = false;
    getGalton(startPoint.features[0].geometry.coordinates, currentMode, currentCity);
}

map.on('load', function () {

  map.addSource('isochrones', { type: 'geojson', data: { type: 'FeatureCollection', features: [] }});
  map.addSource('start', { "type": "geojson",  "data": startPoint });

  map.on('mousemove', function(e) {
     var features = map.queryRenderedFeatures(e.point, { layers: ['start'] });

     // Change point and cursor style as a UI indicator
     // and set a flag to enable other mouse events.
     if (features.length) {
         //map.setPaintProperty ('start', 'circle-color', '#3366FF');
         canvas.style.cursor = 'move';
         isCursorOverPoint = true;
         map.dragPan.disable();
     } else {
         //map.setPaintProperty ('start', 'circle-color', '#0088FF');
         canvas.style.cursor = '';
         isCursorOverPoint = false;
         map.dragPan.enable();
     }
 });

  map.on('mousedown', mouseDown, true);

  map.on('click', function(e) {
    startPoint.features[0].geometry.coordinates = [e.lngLat.lng,e.lngLat.lat];
    map.getSource('start').setData(startPoint);
    getGalton([e.lngLat.lng,e.lngLat.lat], currentMode, currentCity);
  });


  map.on('dragend', function() {

  //  syncMap("mapbox", map.getCenter().toArray(), map.getZoom());
  });

  map.on('zoomend', function() {
  //  syncMap("mapbox", map.getCenter().toArray(), map.getZoom());
  });


  layers.forEach(function (layer, i) {

    map.addLayer({
      'id': 'line-' + i,
      'type': 'line',
      'source': 'isochrones',
      'layout': {},
      'paint': {
        'line-color': layer.color,
        'line-opacity': 1,
        'line-width': 0.3
      },
      'filter': [
        'all',
        ['==', '$type', 'Polygon'],
        ['<=', 'time', layer.time]
      ]
    });


    map.addLayer({
      'id': 'fill-' + i,
      'type': 'fill',
      'source': 'isochrones',
      'layout': {},
      'paint': {
        'fill-color': layer.color,
        'fill-opacity': layer.opacity
      },
      'filter': [
        'all',
        ['==', '$type', 'Polygon'],
        ['<=', 'time', layer.time]
      ]
    }, "road-path");

  map.addLayer({
      "id": "start-border",
      "type": "circle",
      "source": "start",
      "paint": {
          "circle-radius": 16,
          "circle-color": "#FFF",
          "circle-opacity": 0.8
      }
  });

  map.addLayer({
      "id": "start",
      "type": "circle",
      "source": "start",
      "paint": {
          "circle-radius": 12,
          "circle-color": "#555"
      }
  });

});
  setCity(currentCity);
});


function getGalton(coords,mode,city) {


  if(!city) city = currentCity;

  progress.style("display", "block");
  start = coords;

  if(!mode) mode = 'foot';
  var url = galtonUrl + city + '/?lng=' + coords[0] + '&lat=' + coords[1] + intervals;

  if(mode == 'car') {
    url += '&bufferSize=100&cellWidth=0.8';
  } else {
    url += '&bufferSize=5&cellWidth=0.07'
  }


//  turf.bbox(startPoint);
  console.time('request');
  console.log(url);
  d3.json(url, function(data) {
    console.timeEnd('request');
    startPoint.features[0].geometry.coordinates = coords;
      //display mapbox
      map.getSource('start').setData(startPoint);
      map.getSource('isochrones').setData(data);

      console.log(data);

      currentMode = mode;
      progress.style("display", "none");

  });

};
