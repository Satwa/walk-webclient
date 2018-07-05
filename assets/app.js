// Global
let prod = false
if(prod){
    var console = {};
    console.log = function(){};
    console.error = function(){};
    console.warn = function(){};
}


// source: http://doublespringlabs.blogspot.com.br/2012/11/decoding-polylines-from-google-maps.html
var decodePolyline = (encoded) => {
    // array that holds the points
    var points = []
    var index = 0, len = encoded.length;
    var lat = 0, lng = 0;
    while (index < len) {
        var b, shift = 0, result = 0;
        do {

            b = encoded.charAt(index++).charCodeAt(0) - 63;//finds ascii                                                                                    //and substract it by 63
              result |= (b & 0x1f) << shift;
              shift += 5;
        } while (b >= 0x20);
        var dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
        lat += dlat;
        shift = 0;
        result = 0;
    do {
        b = encoded.charAt(index++).charCodeAt(0) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
    } while (b >= 0x20);
    var dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
    lng += dlng;
    points.push([lng / 1E5, lat / 1E5])  
  }
  return points
}


var getUrlParameter = (sParam) => {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
}

var setCookie = (name,value,days) => {
    if(days){
        console.log("Updating...")
        localStorage.setItem("walkLastUpdate", Math.floor(new Date().getTime()/1000) + 8*60*60) // In fact it should be days*24*60*60
    }
    localStorage.setItem(name, value)
}
let getCookie = (name) => {
    let item = localStorage.getItem(name)
    if((name == "walkWalksLimit" || name == "walkSaveWalk") && Math.floor(new Date().getTime()/1000) >= parseInt(localStorage.getItem("walkLastUpdate"))){
        console.log("Reboot...")
        localStorage.removeItem(name)
        localStorage.removeItem("walkSaveWalk")
        localStorage.removeItem("walkLastUpdate")
        return null
    }
    return item
}

let unloadCallback = (e) => {
    if(!document.URL.includes("near") && saveData && goUrl !== undefined && getUrlParameter("id") !== undefined){
        console.log("Saving data!")
        // on est sur l'accueil donc on sauvegarde les variables
        
        let data2save = JSON.stringify({
            goUrl: goUrl,
            saveData: saveData,
            deltaData: deltaData,
            startPoint: startPoint,
            eraseAt: Math.floor(new Date().getTime()/1000) + 4*24*60*60
        })
        console.log(getByteLen(data2save) + " bytes")

        setCookie("walkSaveWalk", data2save)
        return null
    }
}

window.addEventListener("walkdatachanged", unloadCallback)


// Au lieu de s'embêter à détecter tous les types de leave page, on va appeler un event qui va sauvegarder le state à chaque étape
function onWalkDataChange(){
    let e = new CustomEvent("walkdatachanged", {detail: "dataChanged", date: Date.now()})
    window.dispatchEvent(e)
}

function getByteLen(normal_val) {
    // Force string type
    normal_val = String(normal_val);

    var byteLen = 0;
    for (var i = 0; i < normal_val.length; i++) {
        var c = normal_val.charCodeAt(i);
        byteLen += c < (1 <<  7) ? 1 :
                   c < (1 << 11) ? 2 :
                   c < (1 << 16) ? 3 :
                   c < (1 << 21) ? 4 :
                   c < (1 << 26) ? 5 :
                   c < (1 << 31) ? 6 : Number.NaN;
    }
    return byteLen;
}