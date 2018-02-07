mapboxgl.accessToken = "pk.eyJ1Ijoic2F0d2F5YSIsImEiOiJjaWsyaTV1NnQwMzRndm5rcGFyeHh5eWMyIn0.zgAp6M9VhZB3Ep0a7JACVA";

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9?optimize=true',
    //center: [0, 0],
    zoom: 8,
});

var geolocate = new mapboxgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    trackUserLocation: true
});
var directions = new MapboxDirections({
	accessToken: mapboxgl.accessToken,
    unit: 'metric',
    profile: 'walking',
    interactive: false
});


map.addControl(geolocate);
map.addControl(directions, 'top-left');
setTimeout(geolocate._onClickGeolocate.bind(geolocate), 100);

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};