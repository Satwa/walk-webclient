// Global
let prod = true
if(prod){
    var console = {};
    console.log = function(){};
    console.error = function(){};
    console.warn = function(){};
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
    if(name == "walkWalksLimit" && Math.floor(new Date().getTime()/1000) >= parseInt(localStorage.getItem("walkLastUpdate"))){
        console.log("Reboot...")
        localStorage.removeItem(name)
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