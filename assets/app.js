// Global

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
    value.expireTime = Date.now() + days*24*60*60 // timestamp actuel + 24h en minutes en secondes
    try{
        localStorage.setItem(name, value)
    }catch(e){
        alert("Error happened")
        alert(e)
    }
    /*var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";*/
}
let getCookie = (name) => {
    let item = localStorage.getItem(name)
    if(item && item.expireTime >= Date.now()){
        localStorage.removeItem(name)
        return null;
    }
    return item
    /*var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;*/
}

let unloadCallback = (e) => {
    if(!document.URL.includes("near") && saveData && goUrl !== undefined && getUrlParameter("id") !== undefined){
        console.log("Saving data")
        // on est sur l'accueil donc on sauvegarde les variables
        
        let data2save = JSON.stringify({
            goUrl: goUrl,
            saveData: saveData,
            deltaData: deltaData,
            startPoint: startPoint
        })
        console.log(getByteLen(data2save) + " bytes")

        setCookie("walkSaveWalk", data2save, 4/24)
        return null
    }
}

window.addEventListener("walkdatachanged", unloadCallback)
// According to https://www.igvita.com/2015/11/20/dont-lose-user-and-app-state-use-page-visibility/


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