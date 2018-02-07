$('#val').html($("#freeTime").val());
$(document).on('input', '#freeTime', function() {
    $('#val').html($(this).val());
});
var goUrl, geopos;
var allPos = "";
var allSteps = [],
    stepsLocation = [];
var saveData;
var waypoints = "";

// App.js
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



// Home.js
$(document).ready(function(){
	let id = getUrlParameter('id') 

	if(id !== undefined && !isNaN(parseInt(id))){
		// Il existe un id donc on le parse
		$("#searchBtn").prop('disabled', true);
		$("#searchBtn").html("Loading...");
		navigator.geolocation.getCurrentPosition(function(position) {
		  	geopos = {
				lat: position.coords.latitude,
				lon: position.coords.longitude
			};
			getWalk(getUrlParameter('id')).then(oneWalkCallback).catch((e) => console.error(e))
		});
	}
});

$("#searchBtn").click(function(e){
	e.preventDefault();
	if(!geolocate._lastKnownPosition){
		alert("Please wait while map is loading...");
		return false;
	}
  	geopos = {
		lat: geolocate._lastKnownPosition.coords.latitude,
		lon: geolocate._lastKnownPosition.coords.longitude
	};
	//Add Loading
	$("#searchBtn").prop('disabled', true);
	$("#searchBtn").html("Loading...");
	var freeTime = parseInt($("#val").text());
	getNearWalk(geopos, freeTime).then(walkDataCallback);
});

var oneWalkCallback = function(data){
	if(!data){
		$("#searchBtn").prop('disabled', false);
		$("#searchBtn").html("Search a walk");
		return;
	}
	directions.removeRoutes();
	directions.setOrigin([geopos.lon, geopos.lat]);

	
	data.poi = JSON.parse(data.path)
	data.poi.unshift({lat: geopos.lat, lon: geopos.lon, name: "Your position"});
	data.poi.push({lat: geopos.lat, lon: geopos.lon, name: "Your position"});
	delete data.path;
	delete data.provider;


	waypoints += "<li><b>" + data.duration + " min</b></li>";
	for (var i = 0; i < data.poi.length; i++) {
		if(data.poi[i].name === undefined){
			data.poi[i].name = "Your position";
		}
		if(i == data.poi.length - 1){
			//Last
			allPos += data.poi[i].lon + "," + data.poi[i].lat;
		}else{
			allPos += data.poi[i].lon + "," + data.poi[i].lat + ";";
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

	$("#popupSearch").css("display", "none");
	$("#popupChoice").css("display", "none");
	$("#popupList").css("display", "block");
}

var walkDataCallback = function(data){
	$("#searchBtn").prop('disabled', false);
	$("#searchBtn").html("Search a walk");
	if(data.error === undefined){
		saveData = data;

		let walks = "";
		if(data.f !== null)
			walks += "<li>Walk #1" + '<a class="walkDetail" walk-type="f" style="float:right;margin-right: 10px;color:#007AFF;cursor:pointer;"> ➡️ </a>' + "</li>";
		if(data.w !== null)
			walks += "<li>Walk #2" + '<a class="walkDetail" walk-type="w" style="float:right;margin-right: 10px;color:#007AFF;cursor:pointer;"> ➡️ </a>' + "</li>";
		if(data.g !== null)
			walks += "<li>Walk #3" + '<a class="walkDetail" walk-type="g" style="float:right;margin-right: 10px;color:#007AFF;cursor:pointer;"> ➡️ </a>' + "</li>";
		$('#popupChoice ul').html(walks);

		$(".walkDetail").click(function(e){
			e.preventDefault();
			waypoints = "";

			switch($(this).attr("walk-type")){
				case "f":
					data = saveData.f;
					break;
				case "w":
					data = saveData.w;
					break;
				case "g":
					data = saveData.g;
					break;
			}
			goUrl = data.walkId;
			window.history.pushState("", "", 'index.html?id=' + goUrl);
			
			directions.removeRoutes();
			directions.setOrigin([geopos.lon, geopos.lat]);

			waypoints += "<li><b>" + data.duration + " min, " + data.distance + " km </b></li>";
			for (var i = 0; i < data.poi.length; i++) {
				if(data.poi[i].name === undefined){
					data.poi[i].name = "Your position";
				}
				if(i == data.poi.length - 1){
					//Last
					allPos += data.poi[i].lon + "," + data.poi[i].lat;
				}else{
					allPos += data.poi[i].lon + "," + data.poi[i].lat + ";";
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


			$("#popupSearch").css("display", "none");
			$("#popupChoice").css("display", "none");
			$("#popupList").css("display", "block");
		})
	}else{
    	$('#popupList #listStyle').html("I'm sorry but I found nothing interesting <br> You can suggest a walk at <a href='https://twitter.com/getwalkapp' target='_blank'>@getwalkapp</a>");
	}

	$("#popupSearch").css("display", "none");
	$("#popupChoice").css("display", "block");
	$("#popupList").css("display", "none");
}

$("#go").click(function(e){
	e.preventDefault();
	var noSleep = new NoSleep();
	noSleep.enable();
	//window.location.replace("directions.html?id=" + goUrl);
	$("#popupSearch").css("display", "none");
	$("#popupList").css("display", "none");
	$("#information").css("display", "block");
	$("#map").css("height", "100vh");

  	directionsInfo = getDirections(allPos);

	map.resize();
	map.flyTo({
		pitch: 60,
		zoom: 20,
		center: [geopos.lon, geopos.lat]
	});

	if(window.DeviceOrientationEvent) {
		window.addEventListener('deviceorientation', function(event){
			console.log("triggered");
			let compassdir;
			if(event.webkitCompassHeading){
			    compassdir = event.webkitCompassHeading;
		  	}else{
		    	compassdir = event.alpha;
		  	}
			map.easeTo({
				center: [geopos.lon, geopos.lat],
		        pitch: 60,
			    bearing: compassdir,
			});
		});
	}
});
$(".cancel").click(function(e){
	e.preventDefault();
	if($(this).attr("cancel") == "search"){
		$("#popupChoice").css("display", "none");
		$("#popupList").css("display", "none");
		$("#popupSearch").css("display", "block");
	}else{
		$("#popupChoice").css("display", "block");
		$("#popupList").css("display", "none");
		$("#popupSearch").css("display", "none");
	}
	window.history.pushState("", "", 'index.html');
	directions.removeRoutes();
});


function getDirections(allPos){
	$.ajax({
		method: "GET",
		url: "https://api.mapbox.com/directions/v5/mapbox/walking/" + allPos + "?steps=true&access_token=" + mapboxgl.accessToken
	})
	.done(function(data){
   	var steps = data.routes[0].legs[0].steps;
   	let i = 0;
		steps.forEach(function(step) {
	    	i++;
		 	allSteps.push(step.maneuver.instruction);
		 	stepsLocation.push(step.maneuver.location);
		 	if(i == steps.length){
		        $("#information").html(allSteps[0]);
		        //console.log(allSteps);
		        var instructionTimeout = window.setInterval(showCurrentDirection, 1000);
		 	}
		});
	});
}

function showCurrentDirection(){
  	geopos = {
		lat: geolocate._lastKnownPosition.coords.latitude,
		lon: geolocate._lastKnownPosition.coords.longitude
	};
  	let roundValue = 4; // Default is 4, else is for debug (such as 2)
	// console.log("(pos) LAT: " + geopos.lat.toFixed(roundValue) + " - LON: " + geopos.lon.toFixed(roundValue));
	// console.log("(nxt) LAT: " + stepsLocation[0][1].toFixed(roundValue) + "- LON: " + stepsLocation[0][0].toFixed(roundValue));
	if(geopos.lat.toFixed(roundValue) === stepsLocation[0][1].toFixed(roundValue) && geopos.lon.toFixed(roundValue) === stepsLocation[0][0].toFixed(roundValue)){
		$("#information").html(allSteps[1]);
		allSteps.splice(0, 1);
		stepsLocation.splice(0, 1);

		map.flyTo({
			center: [geopos.lon, geopos.lat]
		});

		console.log("Near!");
	}
  	// TODO: let ETA = 2; // v = d/t <=> t = d/v  // https://stackoverflow.com/questions/7687884/add-10-seconds-to-a-javascript-date-object-timeobject
}
