function setCookie(nume, val, timpExpirare){//timpExpirare in milisecunde
    d=new Date();
    d.setTime(d.getTime()+timpExpirare)
    document.cookie=`${nume}=${val}; expires=${d.toUTCString()}`;
}


function getCookie(nume){
    vectorParametri=document.cookie.split(";") // ["a=10","b=ceva"]
    for(let param of vectorParametri){
        if (param.trim().startsWith(nume+"="))
            return param.split("=")[1]
    }
    return null;
}

function deleteCookie(nume){
    console.log(`${nume}; expires=${(new Date()).toUTCString()}`)
    document.cookie=`${nume}=0; expires=${(new Date()).toUTCString()}`;
}

function deleteAllCookies(listaCookies){
    for(let i=0;i<listaCookies.length;i++){
        document.cookie = `${listaCookies[i]}=0; expires=${(new Date()).toUTCString()}`;
    }
}
function set_check(){
    setCookie('linksNewWindow', document.getElementById('linksNewWindow').checked ? 1 : document.getElementById('linksNewWindow').value, 60000);
}

window.addEventListener("load", function(){
    
    if (getCookie('linksNewWindow')){

        document.getElementById('linksNewWindow').checked = getCookie('linksNewWindow')==1? true : false;
        
    }

    if (getCookie("acceptat_banner")){
        document.getElementById("section_banner").style.display="none";
    }
    // deleteCookie('[object HTMLInputElement]');

    this.document.getElementById("ok_cookies").onclick=function(){
        setCookie("acceptat_banner",true,60000); //60000
        document.getElementById("section_banner").style.display="none";
        
    }


})