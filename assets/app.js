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
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
let getCookie = (name) => {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
let eraseCookie = (name) => {   
    document.cookie = name+'=; Max-Age=-99999999;';  
}


window.addEventListener("beforeunload", (e) => {
    console.log("unload!!")
    if(!document.URL.includes("near") && allSteps.length > 0){
        console.log("Saving data")
        // on est sur l'accueil donc on sauvegarde les variables
        
        let data2save = JSON.stringify({
            goUrl: goUrl,
            saveData: saveData,
            startPoint: startPoint
        })
        console.log(getByteLen(data2save))

        setCookie("walkSaveWalk", data2save, 4/24)
        console.log(getCookie("walkSaveWalk"))
    }
})


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