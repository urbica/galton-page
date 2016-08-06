
require("!style!css!./css/style.css");

//var mapboxgl = require('mapbox-gl');
var d3 = require('d3');
var turf = require('turf');

console.log('hello');

/*
mapboxgl.accessToken = 'pk.eyJ1IjoidXJiaWNhIiwiYSI6ImNpamFhZXNkOTAwMnp2bGtxOTFvMTNnNjYifQ.jUuvgnxQCuUBUpJ_k7xtkQ';

var map = new mapboxgl.Map({
    container: 'mymap', // container id
    style: 'mapbox://styles/mapbox/streets-v9', //stylesheet location
    center: [-74.50, 40], // starting position
    zoom: 9 // starting zoom
});
*/


var lang = "en";
var dlang = navigator.language || navigator.userLanguage;
if(dlang=="ru" || dlang=="ru-RU") lang = "ru";

var cities = [
  { id: "moscow", center: [37.617015, 55.750931], ru: "Москва", en: "Moscow" },
  { id: "berlin", center: [13.385706,52.516879], ru: "Берлин", en: "Berlin" },
  { id: "amsterdam", center: [4.893446,52.372732], ru: "Амстердам", en: "Amsterdam" },
  { id: "london", center: [4.893446,52.372732], ru: "Лондон", en: "London" },
  { id: "paris", center: [4.893446,52.372732], ru: "Париж", en: "Paris" }
];

pages = [
  { id: 'about', label: '<span class="lang-ru">О технологии</span><span class="lang-en">About</span>'},
  { id: 'examples', label: '<span class="lang-ru">Примеры</span><span class="lang-en">Examples</span>'},
  { id: 'more', label: '<span class="lang-ru">Узнать больше</span><span class="lang-en">More details</span>'}
];

maps = [
  { id: 'map-mapbox', label: 'Mapbox GL JS'}
];


var currentPage = 'about',
    currentMode = 'foot',
    galtonUrl = 'http://galton.minutes.urbica.co/';

var dataInside, dataOutside;


//blocks
var menu = d3.select("#menu"),
    citiesMenu = d3.select("#cities"),
    selectedCity = d3.select("#selectedCity"),
    modeFoot = d3.select("#mode-foot"),
    modeCar = d3.select("#mode-car"),
    progress = d3.select("#progress"),
    content = d3.select("#content"),
    graph = d3.select("#graph"),
    langRu = d3.select("#lang-ru"),
    langEn = d3.select("#lang-en"),
    dataCheckbox = d3.select("#dataCheckbox");

    langRu
      .on('click', function() {
        lang = 'ru';
        setLang('ru');
      });

    langEn
      .on('click', function() {
        lang = 'en';
        setLang('en');
      });

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

    var citiesMenuShown = false;

    selectedCity.on('click', function() {
      citiesMenu.style("display", "block");
      setTimeout(function() { citiesMenuShown = true; }, 100);
    });

    window.onclick = function() {
      console.log(citiesMenuShown);
      if(citiesMenuShown) {
        citiesMenuShown = false;
        citiesMenu.style("display", "none");
      }
    };



//building pages menu
function getPage(pageID) {
  currentPage = pageID;
  menu.html('');

  pages.forEach(function(p) {
    menu
      .append("div")
      .attr("class", p.id == pageID ? 'menu-item-selected' : 'menu-item')
      .attr("id", "menu-item-"+p.id)
      .html(p.label)
      .on('click', function() {
        getPage(p.id);
      });
    d3.select("#content-"+p.id)
      .style("display", p.id == currentPage ? '' : 'none');
  });
  setLang(lang);

//  d3.selectAll('.lang-en').style('display', 'block');
//  d3.selectAll('.lang-ru').style('display', 'none');
}

//building cities menu
cities.forEach(function(c) {
  var cItem = citiesMenu.append("div").attr("class", "city");
  cItem.append("span").attr("class", "lang-en").text(c.en);
  cItem.append("span").attr("class", "lang-ru").text(c.ru);
  cItem.on('click', function() {
    setCity(c.id);
  })
});

function setCity(id) {
  selectedCity.text('');
  cities.forEach(function(c){
    if(c.id == id) {
      selectedCity.append('span').attr("class", "lang-en").text(c.en);
      selectedCity.append('span').attr("class", "lang-ru").text(c.ru);
      map.setCenter(c.center);
      getGalton(c.center, currentMode);
    }
  });
  setLang(lang);
}




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
    getGalton(startPoint.features[0].geometry.coordinates, 'foot');
  } else {
    modeFoot.attr('class', 'mode');
    modeCar.attr('class', 'mode-selected');
    getGalton(startPoint.features[0].geometry.coordinates, 'car');
  }
}

mapboxgl.accessToken = 'pk.eyJ1IjoidXJiaWNhIiwiYSI6ImNpbnlvMXl4bDAwc293ZGtsZjc3cmV1MWYifQ.ejYUpie2LkrVs_dmQct1jA';

var map = new mapboxgl.Map({
  container: "map-mapbox",
  style: "mapbox://styles/urbica/cinyado0k004cbunmpjsqxlb8",
  center: start,
  zoom: 13
  }),
  canvas = map.getCanvasContainer();

  map.on('click', function(e) {

  	console.log('click'); 
  });

var gridSource = new mapboxgl.GeoJSONSource({
  data: {
    type: 'FeatureCollection',
    features: []
  }
}),
insideSource = new mapboxgl.GeoJSONSource({
  data: {
    type: 'FeatureCollection',
    features: []
  }
}),
outsideSource = new mapboxgl.GeoJSONSource({
  data: {
    type: 'FeatureCollection',
    features: []
  }
});

getPage(currentPage);

setCity('moscow');

//start
setLang(lang);



var layers = [
  [20, '#00aaFF', 0.2],
  [15, '#00aaFF', 0.4],
  [10, '#00aaFF', 0.6]
];

var layersY = {
  '20': {color: '#00aaFF', opacity: 0.2},
  '15': {color: '#00aaFF', opacity: 0.4},
  '10': {color: '#00aaFF', opacity: 0.6}
};

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
    getGalton(startPoint.features[0].geometry.coordinates, currentMode);
}

map.on('load', function () {
  map.addSource('grid', gridSource);
  map.addSource('inside', insideSource);
  map.addSource('outside', outsideSource);

  // Add a single point to the map
  map.addSource('start', {
      "type": "geojson",
      "data": startPoint
  });

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
    getGalton([e.lngLat.lng,e.lngLat.lat], currentMode);
  });


  map.on('dragend', function() {

  //  syncMap("mapbox", map.getCenter().toArray(), map.getZoom());
  });

  map.on('zoomend', function() {
  //  syncMap("mapbox", map.getCenter().toArray(), map.getZoom());
  });


  layers.forEach(function (layer, i) {
    map.addLayer({
      'id': 'grid-' + i,
      'type': 'fill',
      'source': 'grid',
      'layout': {},
      'paint': {
        'fill-color': layer[1],
        'fill-opacity': layer[2]
      },
      'filter': [
        'all',
        ['==', '$type', 'Polygon'],
        ['<=', 'time', layer[0]]
      ]
    }, "road-path");

    map.addLayer({
      'id': 'points-' + i,
      'type': 'circle',
      'source': 'grid',
      'layout': {},
      'paint': {
        "circle-radius": 0,
        "circle-color": layer[1]
      },
      'filter': [
        'all',
        ['==', '$type', 'Point'],
        ['<=', 'time', layer[0]]
      ]
    });
  });

  map.addLayer({
      "id": "outside",
      "type": "circle",
      "source": "outside",
      "paint": {
          "circle-radius": 4,
          "circle-opacity": 0.7,
          "circle-color": "#bbb"
      }
  });

  map.addLayer({
      "id": "inside",
      "type": "circle",
      "source": "inside",
      "paint": {
          "circle-radius": 4,
          "circle-opacity": 0.7,
          "circle-color": "#07c"
      }
  });

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

  //start from start
  //getGalton(start, currentMode);
  setCity('moscow');

});

dataCheckbox.on('change', function() {
  getGalton(start, currentMode);
})

//pre-load data for example
/*
d3.json('data/cafe.geojson', function(d) {
  loadedData = d;
});
*/


function getGalton(coords,mode) {

  console.log(coords);
  console.log(mode);
  var calculate = dataCheckbox.property('checked');
  dataInside = [], dataOutside = [];
  var bb; //if false - not change bbox, if filled (bbox of data - change it)


  progress.style("display", "block");

  start = coords;
  if(!mode) mode = 'foot';

  var url = galtonUrl + mode +  '?lng=' + coords[0] + '&lat=' + coords[1];

  if(mode == 'car') {
    url += '&bufferSize=100&cellWidth=0.8';
  } else {
    url += '&bufferSize=5&cellWidth=0.1'
  }


//  turf.bbox(startPoint);


  console.time('request');
  d3.json(url, function(data) {
//    var debugPoints = turf.featureCollection([]);
//    console.log(data);
    console.timeEnd('request');
    startPoint.features[0].geometry.coordinates = start;

    if(mode !== currentMode) {
    //  bb = turf.buffer(startPoint,0.5,"kilometers");
    //  console.log(turf.bbox(bb));
    }


    //get zones
    /*
    if(calculate) {
      if(!loadedData) {
        d3.json('data/cafe.geojson', function(d) {
          loadedData = d;
          getGalton(coords,mt,mode)
        });
      } else {
        //calculate zones
//        displayZones(loadedData,data,mt);
        console.log('data');
        console.log(data);
        console.log('tagged: ');
        var filtered = data.features.filter(function(f) {
          return f.properties['time'] <= 20;
        });
        var tagged = turf.tag(loadedData, turf.featureCollection(filtered), 'time', 'time');

        dataInside = tagged.features.filter(function(f) {
          return f.properties['time'];
        });
        dataOutside = tagged.features.filter(function(f) {
          return (!f.properties['time']);
        });
        buildGraph(dataInside);
        console.log('inside: ' + dataInside.length);
        console.log('outside: ' + dataOutside.length);

      }

    }
    */


      //display mapbox
      gridSource.setData(data);
      map.getSource('start').setData(startPoint);
      map.getSource('inside').setData(turf.featureCollection(dataInside));
      map.getSource('outside').setData(turf.featureCollection(dataOutside));

      currentMode = mode;
      progress.style("display", "none");

  });
};

function buildGraph(data) {
  //console.log(data);
  graph.text('');
//  var svg = graph.append("svg").attr("width", 300).attr("height", 300);
  var dataBars = [], sumValue = 0, maxValue = 0, scale = 0;
  for(y in layersY) {
    console.log(y + ': ' + layers[y]);
    var f = data.filter(function(d) { return (d.properties['time'] <= y); });
    dataBars.push({caption: y, value: f.length});
    maxValue = (f.length >= maxValue) ? f.length : maxValue;
    sumValue += f.length;
  }
  if(maxValue>0) {
    //scale = 280/maxValue;
  }

  var timesLine = graph.append("div").attr("class", "bar-captions"),
  barLine = graph.append("div").attr("class", "bar-lines"),
  captionsLine = graph.append("div").attr("class", "bar-captions");


  dataBars.forEach(function(db) {

    barLine.append("div").attr("class", "bar")
      .style("width", (db.value/sumValue)*280 + 'px')
      .style("background", 'rgba(0, 153, 255, ' +  layersY[db.caption].opacity*1.7 + ')')
      .text(((db.value/sumValue)*280 >= 30) ? db.value : '');

    timesLine.append("div").attr("class", "bar-caption")
      .style("width", (db.value/sumValue)*280 + 'px')
      .text(((db.value/sumValue)*280 >= 30) ? db.caption + "'" : '');

    });

}
