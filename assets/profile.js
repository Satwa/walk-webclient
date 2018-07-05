console.log("User parameter: " + getUrlParameter('uid'))

$(document).ready(function(){
	let id = getUrlParameter('uid') 

	let reactions = {
		"reaction-O": "💫 Per-fect!",
		"reaction-1": "🏝 Amazing!",
		"reaction-2": "⛺ Enjoyed landscape!",
		"reaction-3": "🏟 Monuments are cool",
		"reaction-4": "🏗 Tough access",
		"reaction-5": "💩 I hated it..."
	}

	if(id !== undefined && !isNaN(parseInt(id))){
		getUserProfile(id).then((data) => {
			if(!data.statusCode){
				console.log("User data found")
				$("#name").html(data.name)
				$(".twoside img").attr("src", data.photo_url)

				let walks = "" 
				for(let i = 0; i < data.walks.length; i++){
					getWalkPicture(data.walks[i].walk_id).then((illustration) => {
						console.log("illustration?")
						$("#img-" + data.walks[i].walk_id).attr("src", illustration.url)
						console.log(illustration)
					}).catch((err) => console.log(err))

					walks += "<li> " + data.walks[i].name + "<br><br><img src='assets/no-file.jpg' id='img-" + data.walks[i].walk_id + "'>" + "<br> <br><i>" + reactions[data.walks[i].reaction] + "</i><br><br>" + "<a onclick='window.location=\"index.html?id=" + data.walks[i].walk_id + "\"' style='text-align:center;color:#007AFF;cursor:pointer;'>Go</a>" + " </li>"
				}
				$("#walks ul").html(walks)

			}else{ window.location = "index.html" }
		}).catch((err) => console.log(err))
	}else{
		window.location = "index.html"
	}
})