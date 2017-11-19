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
function getNearWalk(position, time){
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

function getWalk(id){
	return $.ajax({
		url: "api.php?type=" + "walkid&id=" + id,
		type: "GET"
	})
	.done(function(data){
		return data;
	});
}

function getWalkTimeline(position){
	alert("Not implemented yet");
	return false;

	return $.ajax({
		url: "api.php?type=" + "walktimeline",
		type: "POST",
		data: {
			startLat: position.lat,
			startLon: position.lon,
		}
	})
	.done(function(data){
		console.log(data);
	});
}