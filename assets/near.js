let geopos;
console.log("City param: " + getUrlParameter('city'))

$(document).ready(function(){
	navigator.geolocation.getCurrentPosition(function(position) {
	  	geopos = {
			lat: position.coords.latitude,
			lon: position.coords.longitude
		};
		getWalkTimeline(false, geopos).then((data) => {
			let walks = ""
			for(let i = 0; i < data.length; i++){
				data[i].poi = JSON.parse(data[i].path)
				data[i].poi.unshift({lat: geopos.lat, lon: geopos.lon, name: "Your position"});
				data[i].poi.push({lat: geopos.lat, lon: geopos.lon, name: "Your position"});
				delete data[i].path;
				delete data[i].provider;
// <a href='index.html?id=" + data[i].id + "'>
				walks += "<li> " + data[i].duration + " minutes, " + (data[i].poi.length - 2) + " monuments  <a href='index.html?id=" + data[i].id + "' style='float:right;margin-right: 10px;color:#007AFF;cursor:pointer;'>Go</a></a></li>"
			}
			$("#loading").css("display", "none")
			$("#list ul").html(walks)
		})
	});
});