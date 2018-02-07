var wrapperApi = "api.php?type=";

// Dev wrapper
function getNearWalk(position, time){
	return $.ajax({
		url: wrapperApi + "walk",
		type: "POST",
		data: {
			startLat: position.lat,
			startLon: position.lon,
			time: parseInt(time)
		}
	})
	.done(function(data){
		return data;
	});
}

function getWalk(id){
	return $.ajax({
		url: wrapperApi + "walkid&id=" + id,
		type: "GET"
	})
	.done(function(data){
		return data;
	});
}

function getWalkTimeline(city = false, position = false){
	alert("Not implemented yet");
	return false;
	// By city or position
}