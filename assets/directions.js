var url = new URL(window.location.href);
//console.log(url.searchParams.get("id"));
var flying;
map.on('flystart', function(){
    flying = true;
});/*
map.on('flyend', function(){
    flying = false;
});*/

map.on('moveend', function(e){
	if(!flying){
		loadWalk();
		//map.fire(flyend); 
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

			// Ici on affiche le trajet
			directions.removeRoutes();

			try{
				var geopos = {
					lat: geolocate._lastKnownPosition.coords.latitude,
					lon: geolocate._lastKnownPosition.coords.longitude
				};
			}catch(e){ console.log(e); }

			directions.setOrigin([geopos.lon, geopos.lat]);
			for (var i = 0; i < poiList.length; i++) {
				if(poiList[i].name === undefined){
					poiList[i].name = "Your position";
				}
	            directions.addWaypoint(i, [poiList[i].lon, poiList[i].lat]);
	        }
	        directions.setDestination([geopos.lon, geopos.lat]);

			console.log(poiList);
		})
		.catch(function(err){
			alert("An error occured");
			console.log(err);
		});
}