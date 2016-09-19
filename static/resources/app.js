
//require("!style!css!./css/style.css");
//var d3 = require('d3');
//var turf = require('turf');

var q = function(item){
        var svalue = location.search.match(new RegExp("[\?\&]" + item + "=([^\&]*)(\&?)","i"));
        return svalue ? svalue[1] : svalue;
    };

//detecting language
var detectLang = function() {
    var tlang = "en";
    if(q("l") === "ru" || q("l") === "ru/") {
        tlang = "ru";
    } else {
        var dlang = navigator.language || navigator.userLanguage;
        if(dlang=="ru" || dlang=="ru-RU") tlang = "ru";
    }
    return tlang;
}

var lang = detectLang();
var ll;

//console.log(q("ll"));
if(q("ll")) { ll = q("ll").split(','); }

//main configuration
c = {
  ll: ll ? [+ll[0],+ll[1]] : [37.630190,55.756389], //galton's starting point && center of the map on start
  zoom: q("zoom") ? +q("zoom") : 13,
  city: q("city") ? q("city") : 'moscow_russia', //current city
  mode: q("mode") ? q("mode") : 'foot',
  page: q("page") ? q("page") : 'about', //current page in the panel
  lang: detectLang()
};

var cities = [
  { id: "amsterdam_netherlands", center: [4.893446,52.372732], ru: "Амстердам", en: "Amsterdam" },
  { id: "barcelona_spain", center: [2.1823167543966235,41.38130817484716], ru: "Барселона", en: "Barcelona" }, 
  { id: "beijing_china", center: [116.387548,39.908373], ru: "Пекин", en: "Beijin" },
  { id: "berlin_germany", center: [13.385706,52.516879], ru: "Берлин", en: "Berlin" },
  { id: "madrid_spain", center: [-3.672785,40.423885], ru: "Мадрид", en: "Madrid" },
  { id: "moscow_russia", center: [37.630190,55.756389], ru: "Москва", en: "Moscow" },
  { id: "london_england", center: [-0.098487,51.511382], ru: "Лондон", en: "London" },
  { id: "new-york_new-york", center: [-73.966473,40.778134], ru: "Нью-Йорк", en: "New York" },
  { id: "paris_france", center: [2.293487,48.858881], ru: "Париж", en: "Paris" },
  { id: "prague_czech-republic", center: [14.428296,50.087205], ru: "Прага", en: "Prague" },
//  { id: "saint-petersburg_russia", center: [30.312745,59.938079], ru: "Санкт-Петербург", en: "Saint-Petersburg" },
  { id: "san-francisco_california", center: [-122.409729,37.808164], ru: "Сан-Франциско", en: "San Francisco" }
];

var menuItems = [
  { id: 'about-btn', ref: 'about', ru: 'О&nbsp;проекте', en: 'About' },
  { id: 'cities-btn', ref: 'cities', ru: 'Города', en: 'Cities' }
];

var modes = [
  {id: 'foot', ru: 'Пешком', en: 'Walking'},
  {id: 'car', ru: 'На автомобиле', en: 'Driving'}
  ];

//URL request params
var galtonUrl = 'http://galton.urbica.co/',
    intervals = '&intervals[]=10&intervals[]=20';


//blocks
var citiesList = d3.select("#cities-list"),
    modesList = d3.select('#modes'),
    menu = d3.select('#menu'),
    panel = d3.select('#panel'),
    progress = d3.select("#progress"),
    content = d3.select("#content"),
    mobileBtn = d3.select("#mobile-btn").on('click', function() { panel.style('display', 'block'); }),
    closeBtn = d3.select("#close-btn").on('click', function() { panel.style('display', 'none'); }),
    locationBtn = d3.select("#location-btn"),
    stats = d3.select("#stats");

//ajust content-height in the panel
//var panelBox = d3.select("#about").node().getBoundingClientRect();
//console.log(panelBox);

locationBtn.on('click', function() {
  progress.style('display', 'block');
  navigator.geolocation.getCurrentPosition(function(position) {
    console.log([position.coords.longitude,position.coords.latitude]);
    setParam('ll',[position.coords.longitude,position.coords.latitude]);

    //what if the location far away from city, looking for nearest city
    var currentCity = cities.find(function(city) { return city.id == c.city }),
        distance = turf.distance(turf.point(c.ll),turf.point(currentCity.center), "kilometers");

    //sort cities by distance
    cities.sort(function(a,b) {
      var d = turf.distance(turf.point(c.ll),turf.point(a.center), "kilometers") - turf.distance(turf.point(c.ll),turf.point(b.center), "kilometers")
      return d; 
    });

    //setting nearest city
    if(c.city !== cities[0].id) {
      d3.select('#'+cities[0].id).attr('class', 'city-selected');
      d3.select('#'+c.city).attr('class', 'city');
      setParam('city', cities[0].id);     
    }
 

    map.setCenter(c.ll);
    getGalton(c.ll,c.mode,c.city);

  });
});

function setLang(l) {
    d3.selectAll('.lang-ru').style('display', (l == 'ru') ? 'block' : 'none');
    d3.selectAll('.lang-en').style('display', (l == 'ru') ? 'none' : 'block');
}

//building cities menu
cities.forEach(function(city) {
  var cItem = citiesList.append("div").attr("class", (city.id == c.city) ? "city-selected" : "city").attr('id', city.id);
  cItem.text(city[c.lang]);
  cItem.on('click', function() {
    map.setCenter(city.center);
    getGalton(city.center,c.mode,city.id);
  })
});

//modes list
modes.forEach(function(m) {
  modesList
    .append("div")
    .attr("class", (m.id==c.mode) ? 'mode-selected' : 'mode')
    .attr("id", m.id)
    .text(m[c.lang])
    .on('click', function() {
      changeMode(m.id);
    });
});


//ajust panel height;
setContentHeight(window.innerHeight);

//on resize event listener
window.addEventListener("resize", function() {
    setContentHeight(window.innerHeight);
    if(window.innerWidth > 500) { panel.style("display", "block"); }
});

function setContentHeight(wheight) {
  if(wheight < 510) {
    content.style("height", (wheight - 140) + 'px');
  }
}

//creating menu
menuItems.forEach(function(m) {
  var item = menu.append('div')
    .attr('class', (c.page === m.ref) ? 'menu-item-selected' : 'menu-item')
    .attr('id', 'item-'+m.id);
  item.append('span').attr('class', 'lang-ru').html(m.ru);
  item.append('span').attr('class', 'lang-en').html(m.en);  
  item.on('click', function() {
    setPage(m.ref);
  });
});

function setPage(pageID) {
  menuItems.forEach(function(m) {
    d3.select('#item-'+m.id).attr('class', (pageID === m.ref) ? 'menu-item-selected' : 'menu-item');
    d3.select('#'+m.ref).style('display', (m.ref === pageID) ? 'block' : 'none');
  });
  c.page = pageID;
}

function updateURLParams() {
  var u = './?', t;
  for(i in c) { u += '&'+i + '=' + c[i]; }
  window.history.pushState(null, 'Galton', u);
}

function setParam(key,value) {
  c[key] = value;
  updateURLParams();
}

setPage(c.page);
setLang(c.lang);
updateURLParams();

var startPoint = turf.featureCollection([turf.point(c.ll)]),
    isDragging,
    isCursorOverPoint,
    args = location.search.replace(/^\?/,'').split('&').reduce(function(o, param){ var keyvalue=param.split('='); o[keyvalue[0]] = keyvalue[1]; return o; }, {});

function changeMode(m) {
  d3.select("#"+c.mode).attr('class', 'mode');
  d3.select("#"+m).attr('class', 'mode-selected');
  getGalton(c.ll, m, c.city);
}

mapboxgl.accessToken = 'pk.eyJ1IjoidXJiaWNhIiwiYSI6ImNpbnlvMXl4bDAwc293ZGtsZjc3cmV1MWYifQ.ejYUpie2LkrVs_dmQct1jA';

var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/urbica/cirlzq8g90016gxlz0kijgiwf",
  center: c.ll,
  zoom: c.zoom,
  minZoom: 8
  }),
  canvas = map.getCanvasContainer();

  //start
  setLang(c.lang);
  //setCity(c.city);

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
    getGalton(startPoint.features[0].geometry.coordinates, c.mode, c.city);
}

map.on('load', function () {

  //fading out intro
  d3.select("#intro").style("opacity", 0);
  setTimeout(function() {
    d3.select("#intro").style("display", "none");
  }, 700);


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
    getGalton([e.lngLat.lng,e.lngLat.lat], c.mode, c.city);
  });


  map.on('dragend', function() {
    setParam('center', Math.round(map.getZoom()*10)/10);
  //  syncMap("mapbox", map.getCenter().toArray(), map.getZoom());
  });

  map.on('zoomend', function() {
    setParam('zoom', Math.round(map.getZoom()*10)/10);
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

  //start app
  getGalton(c.ll,c.mode,c.city);

});


function getGalton(coords,mode,city) {


  if(!city) city = c.city;
  //change city scenario
  if(city !== c.city) {
    d3.select("#"+c.city).attr("class", "city");
    d3.select("#"+city).attr("class", "city-selected");
    map.setCenter(coords);
    setParam('city', city);
  }

  if(!mode) mode = 'foot';

  progress.style("display", "block");
  setParam('ll', coords);
  

  var url = galtonUrl + city + '/' + mode +'/?lng=' + coords[0] + '&lat=' + coords[1] + intervals;
  //`http://galton.urbica.co/berlin_germany/foot/?`

  if(mode == 'car') {
    url += '&bufferSize=100&cellWidth=0.8';
  } else {
    url += '&bufferSize=5&cellWidth=0.07'
  }

  startPoint.features[0].geometry.coordinates = coords;
  map.getSource('start').setData(startPoint);

//  console.time('request');
  d3.json(url, function(data) {

    //if mode was changed
    if(mode !== c.mode) { map.flyTo({ center: coords, zoom: (mode == 'foot') ? 13 : 9 }); setParam('mode', mode); }

//    console.timeEnd('request');
      map.getSource('isochrones').setData(data);
      progress.style("display", "none");

//      var stationsWithin = turf.within(stations, data);
//      stats.text(stationsWithin.features.length + ' noise complaints')

  });

};
