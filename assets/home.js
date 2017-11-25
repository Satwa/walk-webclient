$('#val').html( $("#freeTime").val() );
$(document).on('input', '#freeTime', function() {
    $('#val').html( $(this).val() );
});
var goUrl, geopos;

$("#searchBtn").click(function(e){
	e.preventDefault();
	if(!geolocate._lastKnownPosition){
		alert("Please retry!");
		return false;
	}
	//Add Loading
	$("#searchBtn").prop('disabled', true);
	$("#searchBtn").html("Loading...");
	geopos = {
		lat: geolocate._lastKnownPosition.coords.latitude,
		lon: geolocate._lastKnownPosition.coords.longitude
	};
	var freeTime = parseInt($("#val").text());
	var waypoints = "";
	getNearWalk(geopos, freeTime).then(function(data) {
		$("#searchBtn").prop('disabled', false);
		$("#searchBtn").html("Search a walk");
		if(data.error === undefined){
			data = data[0];
			goUrl = data.walkId;
			directions.removeRoutes();
			directions.setOrigin([geopos.lon, geopos.lat]);
			var allPos = "";
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
	       	
	       	//directionsInfo = getDirections(allPos);
	        
	        map.flyTo({
	            center: [geopos.lon, geopos.lat],
	            zoom: 13
	        });
        	$('#popupList #listStyle').html(waypoints);
		}else{
        	$('#popupList #listStyle').html("No cool monument found <br> Suggest a walk at @getwalkapp");
		}


		$("#popupSearch").css("display", "none");
		$("#popupList").css("display", "block");

	});
});
$("#go").click(function(e){
	e.preventDefault();
/*	var noSleep = new NoSleep();
	noSleep.enable();*/
	//window.location.replace("directions.html?id=" + goUrl);
	$("#popupSearch").css("display", "none");
	$("#popupList").css("display", "none");
	$("#map").css("height", "100vh");
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
			    bearing: 360 - compassdir,
			});
		});
	}
	/*
		On dirige vers une autre page dédiée avec : 
			* en haut prochaine direction & ETA, map zoomée sur l'utilisateur
			* en bas lien pour partager la balade sur les réseaux sociaux & ouvrir dans Maps/Plans
		* Réorganiser l'interface
		* Identifier s'il y a un id & showList
	*/
});
$("#cancel").click(function(e){
	e.preventDefault();
	$("#popupSearch").css("display", "block");
	$("#popupList").css("display", "none");
	directions.removeRoutes();
});


function getDirections(allPos){
	$.ajax({
		method: "GET",
		url: "https://api.mapbox.com/directions/v5/mapbox/walking/" + allPos + "?steps=true&access_token=" + mapboxgl.accessToken
	})
	.done(function(data){
		console.log(data);
		return data;
	});
}
