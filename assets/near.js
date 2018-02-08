let geopos;
console.log("City parameter: " + getUrlParameter('city'))

$(document).ready(function(){
	navigator.geolocation.getCurrentPosition(function(position) {
	  	geopos = {
			lat: position.coords.latitude,
			lon: position.coords.longitude
		};
		getWalkTimeline(false, geopos).then((data) => {
			let walks = ""
			let visualData = "";
			for(let i = 0; i < data.length; i++){
				data[i].poi = JSON.parse(data[i].path)
				if(data[i].poi === undefined) continue;
				delete data[i].path;
				delete data[i].provider;
				
				visualData = "<div class='visual' id='" + data[i].id + "'>"
				for(let x = 0; x < data[i].poi.length; x++){
					visualData += data[i].poi[x].name + "<br>"
				}
				visualData += "<a href='index.html?id=" + data[i].id + "' style='margin-right:10px;float:right;color:#007AFF;cursor:pointer;'>Go</a>"
				visualData += "<div style='clear:both'></div></div>"

				walks += "<li> " + data[i].duration + " minutes, " + data[i].poi.length + " monuments  <a class='more' id='" + data[i].id + "' style='float:right;margin-right: 10px;color:#007AFF;cursor:pointer;'>More</a> " + visualData + " </li>"
			}
			$("#loading").css("display", "none")
			
			if(data.length == 0){
				$("#loading").css("display", "block")
				$("#loading").html("No walks found near you, generate some by going on the home page!")
			}

			$("#list ul").html(walks)
			$(".more").click((e) => {
				e.preventDefault()
				let content = e.target.text
				let id = e.target.attributes.id.value
				if(content == "More"){
					e.target.text = "Less"
					$("#" + id + ".visual").slideDown()
				}else{
					e.target.text = "More"
					$("#" + id + ".visual").slideUp()
				}
			})
		});
	});
});