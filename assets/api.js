var rootApi = "http://api.joshua.ovh:3012/";

/*function getWalk(position, time){
	console.log("Clicked!");
	return $.ajax({
		url: rootApi + "walk",
		type: "POST",
		data: {
			startLat: position.lat,
			startLon: position.lon,
			time: parseInt(time)
		}
	})
	.done(function(data){
		if(JSON.stringify(data[0].poi[0]) == JSON.stringify(data[0].poi[1])){
			data.error = "same";
			return data;
		}
		return data;
	});
}*/

// Dev wrapper
function getWalk(position, time){
	console.log("Clicked!");
	return $.ajax({
		url: "api.php?type=" + "walk",
		type: "POST",
		data: {
			startLat: position.lat,
			startLon: position.lon,
			time: parseInt(time)
		}
	})
	.done(function(data){
		if(JSON.stringify(data[0].poi[0]) == JSON.stringify(data[0].poi[1])){
			data.error = "same";
			return data;
		}
		return data;
	});
}