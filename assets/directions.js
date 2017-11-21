var url = new URL(window.location.href);
var flying;
var directionsInfo;
var geopos;

// console.log(url.searchParams.get("showList") != null);

map.on('flystart', function(){
    flying = true;
});

map.on('moveend', function(e){
	if(!flying){
		loadWalk();
		flying = true;
   }
});

function loadWalk(){
	getWalk(url.searchParams.get("id"))
		.then(function(data){
			if(!data){
				alert("This walk was not found");
				window.location.replace("index.html");
			}
			var poiList = JSON.parse(data.path);

			var geopos = {
				lat: geolocate._lastKnownPosition.coords.latitude,
				lon: geolocate._lastKnownPosition.coords.longitude
			};

			// Ici on affiche le trajet
			var allPos = "";
			directions.removeRoutes();
			directions.setOrigin([geopos.lon, geopos.lat]);
			for (var i = 0; i < poiList.length; i++) {
				if(poiList[i].name === undefined){
					poiList[i].name = "Your position";
				}
				if(i == poiList.length - 1){
					//Last
					allPos += poiList[i].lon + "," + poiList[i].lat;
				}else{
					allPos += poiList[i].lon + "," + poiList[i].lat + ";";
				}
	            directions.addWaypoint(i, [poiList[i].lon, poiList[i].lat]);
	        }
	        directions.setDestination([geopos.lon, geopos.lat]);
	        map.easeTo({
				pitch: 60,
				zoom: 18
	        });

	       	//directionsInfo = getDirections(allPos);

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
		})
		.catch(function(err){
			alert("An error occured");
			console.log(err);
		});
}

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
