// window.addEventListener("DOMContentLoaded", function(){
//         teme = ["dark", "light"]
//         temaCurenta = localStorage.getItem("tema");
//         if (temaCurenta){
//             document.body.classList.add(temaCurenta);
//         }
//         document.getElementById("tema").onclick = function(){
//         if (document.body.classList.contains("dark")){
//             document.body.classList.remove("dark");
//             localStorage.removeItem("tema");
//         }
//         else {
//             document.body.classList.add("dark");
//             localStorage.setItem("tema", "dark");
//         }

        
//     }
// });

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

})





