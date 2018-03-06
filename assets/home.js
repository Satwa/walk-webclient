$('#val').html($("#freeTime").val());
$(document).on('input', '#freeTime', function() {
    $('#val').html($(this).val());
});
let _clipboard = new Clipboard('#clipboard');
_clipboard.on('success', (e) => {
	alert("The link has been copied to clipboard, feel free to share it with your friends!")
})

let goUrl, geopos,
	allPos = "",
	allSteps = [],
    stepsLocation = [],
    stepsIcon = [],
    stepsDuration = [],
	saveData,
	waypoints = "",
	loadingWalk = false,
	loadWalkInterval,
	imageStorage = "https://app.walk.cafe/mapbox-directions/",
	markersList = [],
	startPoint = [],
	deltaData

// App.js
mapboxgl.accessToken = "pk.eyJ1Ijoic2F0d2F5YSIsImEiOiJjaWsyaTV1NnQwMzRndm5rcGFyeHh5eWMyIn0.zgAp6M9VhZB3Ep0a7JACVA"

let _map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9?optimize=true',
    zoom: 8,
});

let geolocate = new mapboxgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    trackUserLocation: true
});
let directions = new MapboxDirections({
	accessToken: mapboxgl.accessToken,
    unit: 'metric',
    profile: 'walking',
    interactive: false
});

_map.addControl(geolocate);
_map.addControl(directions, 'top-left');
setTimeout(geolocate._onClickGeolocate.bind(geolocate), 100);


_map.once('load', () => {
	_map.addLayer({
		"id": "places",
		"type": "symbol",
	    "source": {
	        "type": "geojson",
	        "data": {
	            "type": "FeatureCollection",
	            "features": markersList
	        }
	    },
	    "layout": {
	        "icon-image": "{icon}-15",
	        "text-field": "{title}",
	        "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
	        "text-offset": [0, 0.6],
	        "text-anchor": "top",
	        "icon-allow-overlap": true,
	        "text-size": 12
	    }
	})
})


$(document).ready(() => {
	if(getCookie("walkWalksLimit") == null || getCookie("walkWalksLimit") == ""){
		// on crée le cookie
		setCookie("walkWalksLimit", 0, 1)
	}
})

// Home.js
$(document).ready(function(){
	let id = getUrlParameter('id') 

	if(id !== undefined && !isNaN(parseInt(id)) && (getCookie("walkSaveWalk") == null || getCookie("walkSaveWalk") == "")){
		goUrl = id
		// Il existe un id donc on le parse
		$("#searchBtn").prop('disabled', true);
		$("#searchBtn").html("Loading...");

		renderOneWalk()
	}

	// Si le cookie existe, on restaure la balade
	if(getCookie("walkSaveWalk") != "" && getCookie("walkSaveWalk") != null){
		let cookieData = JSON.parse(getCookie("walkSaveWalk"))
		if(Math.floor(new Date().getTime()/1000) >= cookieData.eraseAt){
			console.log("Removing saved walk")
			localStorage.removeItem("walkSaveWalk")
			return
		}
		if(cookieData.goUrl == undefined) return
		// Il existe un cookie donc on le parse
		$("#searchBtn").prop('disabled', true);
		$("#searchBtn").html("Loading...");

		goUrl = cookieData.goUrl
		if(cookieData.deltaData){
			saveData = cookieData.deltaData
		}else{
			saveData = cookieData.saveData
		}
		startPoint = cookieData.startPoint
		restoreWalk()
	}
});

let restoreWalk = () => {
	if(!loadingWalk){
		loadingWalk = true
		loadWalkInterval = setInterval(restoreWalk, 200)
	}
	if(_map.loaded()){
		geopos = {
			lat: geolocate._lastKnownPosition.coords.latitude,
			lon: geolocate._lastKnownPosition.coords.longitude
		}
		clearInterval(loadWalkInterval)
		oneWalkCallback(saveData)
		$("#clipboard").attr("data-clipboard-text", 'https://app.walk.cafe/index.html?id=' + goUrl)
		$("#nearLink").css("display", "none");
		$("#clipboard").css("display", "block");
	}
}




let renderOneWalk = () => {
	// Fonction appelée tant que !_map.loaded()
	if(!loadingWalk){
		loadingWalk = true
		loadWalkInterval = setInterval(renderOneWalk, 300)
	}
	if(_map.loaded()){
		geopos = {
			lat: geolocate._lastKnownPosition.coords.latitude,
			lon: geolocate._lastKnownPosition.coords.longitude
		}
		clearInterval(loadWalkInterval)
		getWalk(getUrlParameter('id')).then(oneWalkCallback).catch((e) => console.error(e))
	}
}

$("#searchBtn").click(function(e){
	e.preventDefault();
	if(!geolocate._lastKnownPosition){
		alert("Please wait while map is loading...");
		return false;
	}
  	geopos = {
		lat: geolocate._lastKnownPosition.coords.latitude,
		lon: geolocate._lastKnownPosition.coords.longitude
	}
	
	//Increment walk limit
	setCookie("walkWalksLimit", parseInt(getCookie("walkWalksLimit"))+1, 1)
	if(getCookie("walkWalksLimit") >= 5){
		// L'utilisateur a déjà généré 5 balades
		alert("Sadly, you already generated more than 5 walks today and because you're a huge fan of crowdsharing you'll excuse us <3")
		return false;
	}
	
	//Add Loading
	$("#searchBtn").prop('disabled', true);
	$("#searchBtn").html("Loading...");
	let freeTime = parseInt($("#val").text());
	getNearWalk(geopos, freeTime).then(walkDataCallback);
});

let oneWalkCallback = function(data){
	if(!data){
		$("#searchBtn").prop('disabled', false);
		$("#searchBtn").html("Search a walk");
		return;
	}
	_paq.push(['trackEvent', 'Load', 'Loading specific walk', data.id]);
	
	if(data.path){
		data.poi = JSON.parse(data.path)
		data.poi.unshift({lat: geopos.lat, lon: geopos.lon, name: "Your position"});
		data.poi.push({lat: geopos.lat, lon: geopos.lon, name: "Your position"});
		delete data.path;
		delete data.provider;
	}else{
		window.history.pushState("", "", "index.html?id=" + goUrl)
	}
	$("#clipboard").attr("data-clipboard-text", 'https://app.walk.cafe/index.html?id=' + data.id)
	
	waypoints += "<li><b>" + data.duration + " min</b>, <b>" + (data.poi.length - 2) + " monuments</b></li>";
	directions.removeRoutes();
	if(startPoint.length == 0){
		startPoint = [geopos.lon, geopos.lat]	
	} 
	if(data.poi[0].name != "Your position"){
		console.log("Start point exists, resetting startPoint")
		data.poi.unshift({lat: geopos.lat, lon: geopos.lon, name: "Your position"})
	}
	
	directions.setOrigin([geopos.lon, geopos.lat]);

	for (let i = 0; i < data.poi.length; i++) {
		if(data.poi[i].name === undefined){
			data.poi[i].name = "Your position";
		}
		

		if(data.poi[i].name !== "Your position"){ 
			addMapMarker(data.poi[i].lon, data.poi[i].lat, data.poi[i].name, i)
		}

		if(i == data.poi.length - 1){
			//Last
			allPos += data.poi[i].lon + "," + data.poi[i].lat;
		}else{
			allPos += data.poi[i].lon + "," + data.poi[i].lat + ";";
		}
        directions.addWaypoint(i, [data.poi[i].lon, data.poi[i].lat]);
        waypoints += "<li>" + data.poi[i].name.replace(/<br\s*[\/]?>/gi, " ") + "</li> \n";
    }
    directions.setDestination(startPoint);
	displayMapMarker()
    _map.flyTo({
        center: [geopos.lon, geopos.lat],
        zoom: 13
    });
	$('#popupList #listStyle').html(waypoints);
	$("#popupSearch").css("display", "none");
	$("#popupChoice").css("display", "none");
	$("#popupList").css("display", "block");
	saveData = data
	onWalkDataChange()
}

let walkDataCallback = function(data){
	$("#searchBtn").prop('disabled', false);
	$("#searchBtn").html("Search a walk");

	if(data.error === undefined){
		saveData = data
		let i = 1
		let walks = ""
		if(data.f.poi !== undefined){
			walks += "<li>Walk #" + i + " (" + data.f.duration + "min, " + (data.f.poi.length - 2) + " POI)" + '<a class="walkDetail" walk-type="f" style="float:right;margin-right: 10px;color:#007AFF;cursor:pointer;"> ➡️ </a>' + "</li>";
			i++
		}
		if(data.w.poi !== undefined){
			walks += "<li>Walk #" + i + " (" + data.w.duration + "min, " + (data.w.poi.length - 2) + " POI)" + '<a class="walkDetail" walk-type="w" style="float:right;margin-right: 10px;color:#007AFF;cursor:pointer;"> ➡️ </a>' + "</li>";
			i++
		}
		if(data.g.poi !== undefined){
			walks += "<li>Walk #" + i + " (" + data.g.duration + "min, " + (data.g.poi.length - 2) + " POI)" + '<a class="walkDetail" walk-type="g" style="float:right;margin-right: 10px;color:#007AFF;cursor:pointer;"> ➡️ </a>' + "</li>";
		}

		$('#popupChoice ul').html(walks);

		$(".walkDetail").click(function(e){
			e.preventDefault();
			waypoints = "", allPos = "";

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
			deltaData = data
			goUrl = data.walkId;
			window.history.pushState("", "", 'index.html?id=' + goUrl);
			$("#clipboard").attr("data-clipboard-text", 'https://app.walk.cafe/index.html?id=' + goUrl)

			directions.removeRoutes();
			startPoint = [geopos.lon, geopos.lat]
			directions.setOrigin(startPoint);

			waypoints += "<li><b>" + data.duration + " min, " + data.distance + " km</b></li>";
			for (let i = 0; i < data.poi.length; i++) {
				if(data.poi[i].name === undefined){
					data.poi[i].name = "Your position";
				}

				if(data.poi[i].name !== "Your position"){ 
					addMapMarker(data.poi[i].lon, data.poi[i].lat, data.poi[i].name, i)
				}
				
				if(i == data.poi.length - 1){
					//Last
					allPos += data.poi[i].lon + "," + data.poi[i].lat;
				}else{
					allPos += data.poi[i].lon + "," + data.poi[i].lat + ";";
				}
	            directions.addWaypoint(i, [data.poi[i].lon, data.poi[i].lat]);
	            waypoints += "<li>" + data.poi[i].name.replace(/<br\s*[\/]?>/gi, " ") + "</li> \n";
	        }
	        directions.setDestination([geopos.lon, geopos.lat]);
			displayMapMarker()
	        _map.flyTo({
	            center: [geopos.lon, geopos.lat],
	            zoom: 13
	        });
        	$('#popupList #listStyle').html(waypoints);

			$("#popupSearch").css("display", "none");
			$("#popupChoice").css("display", "none");
			$("#popupList").css("display", "block");
			onWalkDataChange()
		})
		if(data.g.poi == data.f.poi && data.f.poi == data.w.poi && data.w.poi == undefined){
			saveData = null
    		$('#popupChoice ul').html("I'm sorry but I found nothing interesting <br> You can suggest a walk at <a href='https://twitter.com/getwalkapp' target='_blank'>@getwalkapp</a>");
		}

	}else{
		saveData = null
    	$('#popupChoice ul').html("I'm sorry but I found nothing interesting <br> You can suggest a walk at <a href='https://twitter.com/getwalkapp' target='_blank'>@getwalkapp</a>");
	}
	$("#popupSearch").css("display", "none");
	$("#popupChoice").css("display", "block");
	$("#popupList").css("display", "none");
}

let addMapMarker = (lon, lat, title, index) => {
	markersList.push({
		"type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [lon, lat]
        },
        "properties": {
            "title": index + " - " + title.replace(/<br\s*[\/]?>/gi, " "),
            "icon": "monument",
            /*"description": "Ea minim duis anim fugiat nostrud elit incididunt dolore ut."*/
        }
	})
} 

let displayMapMarker = () => {
	_map.getSource("places").setData({
        "type": "FeatureCollection",
        "features": markersList
    })
}

/*
	LATER: Informations à propos du POI
_map.on('click', 'places', function (e) {
    let coordinates = e.features[0].geometry.coordinates.slice();
    let description = e.features[0].properties.description;

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(description)
        .addTo(map);
});

// Change the cursor to a pointer when the mouse is over the places layer.
_map.on('mouseenter', 'places', function () {
    _map.getCanvas().style.cursor = 'pointer';
});

// Change it back to a pointer when it leaves.
_map.on('mouseleave', 'places', function () {
    _map.getCanvas().style.cursor = '';
});
*/

$("#go").click(function(e){
	e.preventDefault()
	$("#nearLink").css("display", "none");
	$("#clipboard").css("display", "block");

	$("#popupSearch").css("display", "none");
	$("#popupList").css("display", "none");
	$("#information").css("display", "block");
	$("#map").css("height", "100vh");

	// On enregistre le choix de l'utilisateur si goUrl défini (sur un malentendu il peut y avoir une erreur)
	if(goUrl !== undefined){
		saveUserChoice(goUrl)
	}
	if(deltaData){
		saveData = deltaData
	}


  	directionsInfo = getDirections(allPos);
  	_paq.push(['trackEvent', 'Click', 'Started walk', goUrl]);

	_map.resize();
	_map.flyTo({
		pitch: 60,
		zoom: 20,
		center: [geopos.lon, geopos.lat]
	});

	if(window.DeviceOrientationEvent) {
		$("#disableCompass").css("display", "block")
		rotationEvent()
	}
	onWalkDataChange()
});
$(".cancel").click(function(e){
	e.preventDefault();
	// On supprime le cookie, dans tous les cas il est réécrit
	setCookie("walkSaveWalk", "")
	if($(this).attr("cancel") == "search"){
		$("#popupChoice").css("display", "none");
		$("#popupList").css("display", "none");
		$("#popupSearch").css("display", "block");
	}else{
		$("#popupChoice").css("display", "block");
		$("#popupList").css("display", "none");
		$("#popupSearch").css("display", "none");
	}
	if(loadingWalk){
		$("#searchBtn").prop('disabled', false);
		$("#searchBtn").html("Search a walk");
		$("#popupChoice").css("display", "none");
		$("#popupList").css("display", "none");
		$("#popupSearch").css("display", "block");
		loadingWalk = false
	}
	markersList = []
	displayMapMarker()

	window.history.pushState("", "", 'index.html');
	directions.removeRoutes();
});

$("#disableCompass").click((e) => rotationEvent())

let rotationEventCallback = (event) => {
	let compassdir;
	if(event.webkitCompassHeading){
	    compassdir = event.webkitCompassHeading;
  	}else{
    	compassdir = event.alpha;
  	}
	_map.flyTo({
        pitch: 60,
	    bearing: compassdir
	});
}

let activate = 1
let rotationEvent = () => {
	if(activate){
		// On le crée
		window.addEventListener('deviceorientation', rotationEventCallback);
		activate = 0
		$("#disableCompass").css("opacity", "1")
	}else{
		// On le supprime
		$("#disableCompass").css("opacity", ".5")
		window.removeEventListener('deviceorientation', rotationEventCallback)
		activate = 1
	}
}


let reducer = (acc, cntVal) => acc + cntVal
let _time = new Date()
let allStepsInfo = ""


function getDirections(allPos){
	$.ajax({
		method: "GET",
		timeout: 3000,
		url: "https://api.mapbox.com/directions/v5/mapbox/walking/" + allPos + "?steps=true&access_token=" + mapboxgl.accessToken
	})
	.done(function(data){
		// console.log(data)
	   	let legs = data.routes[0].legs
	   	let i = 0, name
	   	legs.forEach((leg, index, array) => {
	   		leg.steps.forEach((step) => {
	   			i++

		    	if(step.maneuver.modifier){
		    		// Le modifier existe
		    		name = "direction_" + step.maneuver.type.split(" ").join("_") + "_" + step.maneuver.modifier.split(" ").join("_") + ".png"
		    	}else{
		    		name = "direction_" + step.maneuver.type.split(" ").join("_") + ".png"
		    	}
		    	stepsIcon.push(name); // All steps icon
			 	allSteps.push(step.maneuver.instruction); // All steps instruction 
			 	stepsLocation.push(step.maneuver.location); // All steps position
			 	if(step.duration !== 0) stepsDuration.push(step.duration) // All steps duration

			 	if(i == leg.steps.length){
			 		_time.setTime(_time.getTime() + stepsDuration.reduce(reducer)*1000)
			        $("#information #current").html("<img src='" + imageStorage + stepsIcon[0] + "'>" + allSteps[0] + "<span style='float:right'>" + _time.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'}) + "</span>");

			        let instructionTimeout = window.setInterval(showCurrentDirection, 1000);
			 	}
	   		})
	   		if(index == array.length-1){
		        for(let x = 1; x < allSteps.length; x++){
					allStepsInfo += "<li>" + "<img src='" + imageStorage + stepsIcon[x] + "'>" + allSteps[x] + "</li>"
					$("#information #all").css("display", "none").html(allStepsInfo)
				}
	   		}
	   	})
	}).catch((err) => console.log(err));
}

function showCurrentDirection(){
  	geopos = {
		lat: geolocate._lastKnownPosition.coords.latitude,
		lon: geolocate._lastKnownPosition.coords.longitude
	};
  	let roundValue = 4; // Default is 4, else is for debug (such as 2). Maybe it works w/ 3?
	/* 
	console.log("(pos) LAT: " + geopos.lat.toFixed(roundValue) + " - LON: " + geopos.lon.toFixed(roundValue));
	console.log("(nxt) LAT: " + stepsLocation[0][1].toFixed(roundValue) + " - LON: " + stepsLocation[0][0].toFixed(roundValue));
	console.log(geopos.lat.toFixed(roundValue) == stepsLocation[0][1].toFixed(roundValue) && geopos.lon.toFixed(roundValue) == stepsLocation[0][0].toFixed(roundValue))
	console.log(geopos.lat.toFixed(roundValue) === stepsLocation[0][1].toFixed(roundValue) && geopos.lon.toFixed(roundValue) === stepsLocation[0][0].toFixed(roundValue))
	console.log("===========================================================")
	*/

	// On met toujours à jour par sécurité, si y'a un bouchon sur le trottoir
	// En fait non, _time.setTime(new Date().getTime() + stepsDuration.reduce(reducer)*1000)
	$("#information #current span").html(_time.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'}))

	if(geopos.lat.toFixed(roundValue) == stepsLocation[0][1].toFixed(roundValue) && geopos.lon.toFixed(roundValue) == stepsLocation[0][0].toFixed(roundValue)){
		// On met à jour l'affichage
		onWalkDataChange()

		stepsDuration.splice(0, 1)
		_time.setTime(new Date().getTime() + stepsDuration.reduce(reducer)*1000)

		$("#information #current").html("<img src='" + imageStorage + stepsIcon[1] + "'>" + allSteps[1] + "<span style='float:right'>" + _time.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'}) + "</span>");
		
		// On retire de l'array
		saveData.poi.splice(0, 1)
		stepsIcon.splice(0, 1);
		allSteps.splice(0, 1);
		stepsLocation.splice(0, 1);

		if(allSteps.length == 0){
			alert("Did you enjoy your Walk? We would be happy to hear about you! <3")
			_paq.push(['trackEvent', 'Done', 'Finished walk', data.id]);
			console.log("Done!")
		}

		allStepsInfo = ""
 		for(let x = 1; x < allSteps.length; x++){
			allStepsInfo += "<li>" + "<img src='" + imageStorage + stepsIcon[x] + "'>" + allSteps[x] + "</li>"
			$("#information #all").css("display", "none").html(allStepsInfo)
		}


		_map.flyTo({
			center: [geopos.lon, geopos.lat]
		});

		console.log("Near!");
	}
}
let infoState = 0
$("#information").click((e) => {
	if(infoState === 0){
		infoState = 1
		$("#information #all").css("border-bottom", "2px solid #CCC")
		$("#information #all").slideUp()
	}else{
		$("#information #all").slideDown()
		infoState = 0
	}
})
