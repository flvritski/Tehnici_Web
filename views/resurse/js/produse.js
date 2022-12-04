
// window.onload = function(){
//     x = 100
//     document.getElementById("filtrare").onclick=function(){
//         var inpNume = document.getElementById("inp-nume").value.toLowerCase();
//         var inpCategorie = document.getElementById("inp-categorie").value;
//         var inpRad1 = document.getElementById("i_rad1").value;
//         var val_superioara_rad1 = parseInt(inpRad1.replace('0:', ''));

//         var produse = document.getElementsByClassName("produs");
//         for (let produs of produse){
//             var cond1 = false;
//             var cond2 = false;
//             var cond3 = false;
//             produs.style.display = "none";
//             let nume = produs.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase().trim();
//             let gramaj = parseInt(produs.getElementsByClassName("val-gramaj")[0].innerHTML);
//             if(gramaj < val_superioara_rad1){
//                 cond3 = true;

//             }
//             if(nume.includes(inpNume)){
//                 cond1 = true;
//             }
//             let categorie = produs.getElementsByClassName("val-categorie")[0].innerHTML;
//             if(inpCategorie=="toate" ||  categorie == inpCategorie){
//                 cond2 = true;
//             }
//             if (cond1 && cond2  ){
//                 produs.style.display = "block";
//             }


//         }
//     }

//     document.getElementById("resetare").onclick=function(){
//         var produse = document.getElementsByClassName("produs");
//         for (let produs of produse){
//             produs.style.display = "block";
//         }
//         // resetare filtre
//         document.getElementById("inp-nume") = "";
//         document.getElementsById("sel-toate").selected = true;
//     }

//     document.getElementById("sortCrescNume").onclick=function(){
//         var produse = document.getElementsByClassName("produs");
//         var v_produse = Array.from(produse);
//         var p = document.createElement("p");
//         p.innerHTML = "hello world";
//         document.body.appendChild(p);
//         v_produse.sort(function(a,b){
//             var pret_a = parseFloat(a.getElementsByClassName("val-pret")[0].innerHTML)
//             var pret_b = parseFloat(b.getElementsByClassName("val-pret")[0].innerHTML)   
//             if (pret_a ==pret_b){
//                 var nume_a = a.getElementsByClassName("val-nume")[0].innerHTML;
//                 var nume_b = b.getElementsByClassName("val-nume")[0].innerHTML;
//                 return nume_a.localeCompare(nume_b);
//             }         
//           return pret_a - pret_b;
//         })
//     }

// }
window.onload= function(){
    x=100
    document.getElementById("filtrare").onclick=function(){
        var inpNume=document.getElementById("inp-nume").value.toLowerCase().trim();
        var inpCategorie=document.getElementById("inp-categorie").value;
        //rad1
        var inpRad1 = document.getElementById("i_rad1").value;
        var val_superioara_rad1 = parseInt(inpRad1.replace('0:', ''));
        //rad2
        var inpRad2 = document.getElementById("i_rad2").value;
        var val_inferioara_rad2 = inpRad2.split(":")[0];
        var val_superioara_rad2 = inpRad2.split(":")[1];
        //rad3
        var inpRad3 = document.getElementById("i_rad3").value;
        var val_inferioara_rad3 = parseInt(inpRad3.split(":")[0]);
        //rad4
        var inpRad4 = document.getElementById("i_rad4").value;
        //inp-pret
        var inpPret = parseInt(document.getElementById("inp-pret").value);
        //voucher
        var inpVoucher = document.getElementById("inp-voucher").value;


        var produse=document.getElementsByClassName("produs");

        for (let produs of produse){
            var cond1=false, cond2=false, cond3=false, cond4=false, cond5=false, cond6=false,cond7=false, cond8=false;

            produs.style.display="none";

            let nume= produs.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase().trim();
            if(nume.includes(inpNume) && inpNume.length!=0){
                cond1=true;
            }
            let categorie= produs.getElementsByClassName("val-categorie")[0].innerHTML;
            if(inpCategorie=="toate" || categorie==inpCategorie){
                cond2=true;
            }
            if(cond1 && cond2 ){
                produs.style.display="block";
            }

            
            let gramaj = produs.getElementsByClassName("val-gramaj")[0].innerHTML;
            if(document.getElementById("i_rad1").checked && gramaj <= val_superioara_rad1){
                cond3=true;
            }
            if(document.getElementById("i_rad2").checked && gramaj >= val_inferioara_rad2 && gramaj <= val_superioara_rad2){
                cond4=true;
            }
            if(document.getElementById("i_rad3").checked && gramaj >= val_inferioara_rad3){
                cond5=true;
            }
            if(document.getElementById("i_rad4").checked && gramaj <= 1425){
                cond6=true;
            }
            
            let pret = parseInt(produs.getElementsByClassName("val-pret")[0].innerHTML);
            if(pret<=inpPret){
                cond7=true;
            }
            if(document.getElementById("inp-voucher").checked===true && produs.getElementsByClassName("val-voucher")[0].innerHTML==="true"){
                cond8=true;
            }
            
            if(cond3){
                produs.style.display="block";
            }
            if(cond4){
                produs.style.display="block";
            }
            if(cond5){
                produs.style.display="block";
            }
            if(cond7){
                produs.style.display="block";
            }
            if(cond8){
                produs.style.display="block";
            }
            
            
        }
    }

    document.getElementById("resetare").onclick=function(){
        //resteare produse
        var produse=document.getElementsByClassName("produs");
        for (let produs of produse){
            produs.style.display="block";
        }
        //resetare filtre
        document.getElementById("inp-nume").value="";
        document.getElementById("sel-toate").selected=true;
        document.getElementById("inp-voucher").checked=false;
        document.getElementById("inp-pret").value="0";

    }

    function sorteaza(semn){
        var produse=document.getElementsByClassName("produs");
        var v_produse=Array.from(produse);


        v_produse.sort(function(a,b){
            var pret_a=parseFloat(a.getElementsByClassName("val-pret")[0].innerHTML);
            var pret_b=parseFloat(b.getElementsByClassName("val-pret")[0].innerHTML);
            if(pret_a==pret_b){
                var nume_a=a.getElementsByClassName("val-nume")[0].innerHTML;
                var nume_b=b.getElementsByClassName("val-nume")[0].innerHTML;
                return semn*nume_a.localeCompare(nume_b);
            }
            return (pret_a-pret_b)*semn;
        })
        for (let produs of v_produse){
            produs.parentNode.appendChild(produs);
        }       
    }

    document.getElementById("sortCrescNume").onclick=function(){
        sorteaza(1);
    }
    document.getElementById("sortDescrescNume").onclick=function(){
        sorteaza(-1);
    }

}