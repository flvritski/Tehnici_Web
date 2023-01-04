window.addEventListener("DOMContentLoaded", function(){
    teme = ["dark", "light"];
    temaCurenta = this.localStorage.getItem("tema");
    if(temaCurenta){
        this.document.body.classList.add(temaCurenta)
    }
    this.document.getElementById("tema").onclick = function(){
        temaCurenta = localStorage.getItem("tema");
        if(temaCurenta){
            if(temaCurenta=="dark"){
            this.innerHTML="<i class='fas fa-sun'></i>"
            }
            else {
                this.innerHTML="<i class='fas fa-moon'></i>"
            }
            indexCurent = teme.indexOf(temaCurenta);
            document.body.classList.remove(temaCurenta);
        }
        else {
            indexCurent = -1; 
        }
        indexCurent++;

        if(indexCurent >= teme.length){
            indexCurent = -1;
            // document.body.classList.remove(temaCurenta);
        }
        document.body.classList.add(teme[indexCurent]);
        localStorage.setItem("tema", teme[indexCurent]);

    }



    this.document.getElementById("flexSwitchCheckChecked").onclick = function(){
        // temaCurenta = localStorage.getItem("tema");
        // if(temaCurenta){
        //     indexCurent = teme.indexOf(temaCurenta);
        //     document.body.classList.remove(temaCurenta);
        // }
        // else {
        //     indexCurent = -1; 
        // }
        // indexCurent++;

        // if(indexCurent >= teme.length){
        //     indexCurent = -1;
        //     // document.body.classList.remove(temaCurenta);
        // }
        // document.body.classList.add(teme[indexCurent]);
        // localStorage.setItem("tema", teme[indexCurent]);
        if (document.body.classList.contains("dark")){
            document.body.classList.remove("dark");
            localStorage.removeItem("tema");
            if(temaCurenta=="dark"){
                document.getElementById("tema").innerHTML="<i class='fas fa-sun'></i>"
                }
                
        }
        else{
            document.body.classList.add("dark");
            localStorage.setItem("tema","dark");
            document.getElementById("tema").innerHTML="<i class='fas fa-moon'></i>"
        }
    }

})





