mapboxgl.accessToken = "pk.eyJ1Ijoic2F0d2F5YSIsImEiOiJjaWsyaTV1NnQwMzRndm5rcGFyeHh5eWMyIn0.zgAp6M9VhZB3Ep0a7JACVA";

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9',
    center: [-74.50, 40],
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
setTimeout(geolocate._onClickGeolocate.bind(geolocate), 250);


$('#val').html( $("#freeTime").val() );
$(document).on('input', '#freeTime', function() {
    $('#val').html( $(this).val() );
});

$("#searchBtn").click(function(e){
	e.preventDefault();
	if(!geolocate._lastKnownPosition){
		return false;
	}
	//Add Loading
	$("#searchBtn").prop('disabled', true);
	$("#searchBtn").html("Loading...");
	var geopos = {
		lat: geolocate._lastKnownPosition.coords.latitude,
		lon: geolocate._lastKnownPosition.coords.longitude
	};
	var freeTime = parseInt($("#val").text());
	var waypoints = "";
	getWalk(geopos, freeTime).then(function(data) {
		$("#searchBtn").prop('disabled', false);
		$("#searchBtn").html("Search a walk");
		if(data.error === undefined){
			data = data[0];
			directions.removeRoutes();
			directions.setOrigin([geopos.lon, geopos.lat]);
	        waypoints += "<li><b>" + data.duration + " min, " + data.distance + " km </b></li>";
			for (var i = 0; i < data.poi.length; i++) {
				if(data.poi[i].name === undefined){
					data.poi[i].name = "Your position";
				}
	            directions.addWaypoint(i, [data.poi[i].lon, data.poi[i].lat]);
	            waypoints += "<li>" + data.poi[i].name + "</li> \n";
	        }
	        directions.setDestination([geopos.lon, geopos.lat]);
	        map.flyTo({
	            center: [geopos.lon, geopos.lat],
	            zoom: 13
	        });
        	$('#popupList #listStyle').html(waypoints);
		}else{
        	$('#popupList #listStyle').html("No cool monument foud <br> Suggest a walk at @getwalkapp");
		}


		$("#popupSearch").css("display", "none");
		$("#popupList").css("display", "block");

	});
});
$("#go").click(function(e){
	e.preventDefault();
	/*
		On dirige vers une autre page dédiée avec : 
			* en haut prochaine direction & ETA, map zoomée sur l'utilisateur
			* en bas lien pour partager la balade sur les réseaux sociaux & ouvrir dans Maps/Plans
	*/
});
$("#cancel").click(function(e){
	e.preventDefault();
	$("#popupSearch").css("display", "block");
	$("#popupList").css("display", "none");
	directions.removeRoutes();
});