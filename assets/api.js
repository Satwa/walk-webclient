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
	// By position
	return $.ajax({
		url: wrapperApi + "timeline",
		type: "POST",
		data: {
			startLat: position.lat,
			startLon: position.lon,
		}
	})
	.done(function(data){
		return data;
	});

	// By city or position
}

function saveUserChoice(id){
	return $.ajax({
		url: wrapperApi + "saveWalk&id=" + id,
		type: "GET"
	})
	.done((data) => {return data})
}