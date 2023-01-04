window.addEventListener("DOMContentLoaded", function(){
    x=100

   //================== preluare date din cos virtual (din localStorage)
   // in localStorage (unde retinem numai string-uri key valoare) vom memora cosul virtual ca o lista de id-uri seperate prin virgula
   // daca vreau si cantitate "3|2, 5|1, 1|7" prajitura 3 (2 bucati), prajitura 5 (1 bucata), ....
   let iduriProduse = this.localStorage.getItem("cos_virtual");
   iduriProduse=iduriProduse?iduriProduse.split(","):[]


    vectorProduse = document.getElementsByClassName("produs");
    ii=0;
    for(let prod of vectorProduse){
        ii++;
        prod.style.display="none"
        var a = setTimeout(function () {
            prod.style.display="block";
        }, ii*500)
    } 

    for (let idp of iduriProduse){
        let ch = document.querySelector(`[value='${idp}'].select-cos`) //querySelector il returneaza pe primul, iar querySelectorAll returneaza o lista
        if(ch){
            ch.checked=true
        } else {
            console.log("id cos virtual inexistent:", idp)
        }
    }

    //=============== adaugare date in cosul virtual (din localStorage)
    let checkboxuri = document.getElementsByClassName("select-cos");
    for (let ch of checkboxuri){
        ch.onchange=function(){
            let iduriProduse = localStorage.getItem("cos_virtual")
            iduriProduse = iduriProduse?iduriProduse.split(","):[];
            if(this.checked){
                iduriProduse.push(this.value)
            }
            else {
                let poz = iduriProduse.indexOf(this.value)
                if(poz != -1){
                    iduriProduse.splice(poz,1)
                }
            }
            localStorage.setItem("cos_virtual", iduriProduse.join(","))
        }
    }
   
    
    //cookies
    try{
    cookie = document.cookie;
    ultimulProdusAfisat = cookie.split("; ")[1].split("=")[1];
    document.querySelector("#ultimul-produs").innerText="Id-ul produsului selectat = " + ultimulProdusAfisat;
    }
    catch(e) {
        console.log(e);
    }
    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };


    document.getElementById("inp-pret").onchange=function(){
        document.getElementById("infoRange").innerHTML = `(${this.value})`
    }
    for (let i=0; i<document.getElementsByClassName("val-time").length; i++){
        var currentDate = new Date(document.getElementsByClassName("val-time")[i].innerHTML)
        var time = currentDate.toLocaleDateString('ro-RO', options)
        document.getElementsByClassName("val-time")[i].innerHTML=time;
        lista_cuvinte = document.getElementsByClassName("val-time")[i].innerHTML.split(" ")
        lista_cuvinte[0]=lista_cuvinte[0].replace(",","")
        zi = lista_cuvinte.splice(0,1)
        zi = "[" + zi + "]"
        lista_cuvinte.push(zi)
        calendar = lista_cuvinte.join(" ")
        document.getElementsByClassName("val-time")[i].innerHTML=calendar;

        
    }

    document.getElementById("filtrare").onclick=function(){


        condValidare = true;
        var inpNume=document.getElementById("inp-nume").value.toLowerCase().trim();
        condValidare = condValidare && inpNume.match(new RegExp("^[a-zA-Z]*$"))
        if (!condValidare){
            alert("Inputuri gresite!");
            document.querySelector("#inp-nume").className = "form-control is-invalid"
            return;
        } else {
            document.querySelector("#inp-nume").className = "form-control"

        }   
        greseli_permise = 2;
        var inpCategorie=document.getElementById("inp-categorie").value;
        //select multiplu
        const selected = document.querySelectorAll('#inp-garantie option:checked');
        const values = Array.from(selected).map(el => el.value);

        //datalist
        var datalist_values = document.getElementById("exampleDataList").value;

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
        var val_superioara_rad4 = inpRad4.split(":")[1];
        //inp-pret
        var inpPret = parseInt(document.getElementById("inp-pret").value);
        //voucher
        var inpVoucher = document.getElementById("inp-voucher").value;

        //are sau nu_are

        var produse=document.getElementsByClassName("produs");

        interval=1000;
        counter = 0;
       

        
        i=0;
        
        for (let produs of produse){
            i++
            produs.style.display="none";
           

            var cond1=false, cond2=false, cond3=false, cond4=false, 
            cond5=false, cond6=false,
            cond7=false, cond8=false,cond9=false,
            cond10=false, cond11=false, cond12=false, cond13=false;

            
            // produs.style.display="none";

            let nume= produs.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase().trim();
            mistakes=0;
            
            if (inpNume.length !== 0) {
            for (i=0;i<inpNume.length;i++){
                if(inpNume[i]!==nume[i]){
                    mistakes++;
                    }
                }
                if (mistakes<=2){
                    inpNume = nume.toLowerCase().trim().split(" ")[0]
                }
            }   
            
            console.log(mistakes)

            if(nume.includes(inpNume) && inpNume.length != 0){
                cond1=true;
            }
            let categorie= produs.getElementsByClassName("val-categorie")[0].innerHTML;
            if(inpCategorie=="toate" || categorie==inpCategorie){
                cond2=true;
            }
            let garantie = produs.getElementsByClassName("val-garantie")[0].innerHTML;
            if (values.includes(garantie)){
                produs.style.display="block";
            }

            if (produs.getElementsByClassName("val-tip")[0].innerHTML === datalist_values ){
                produs.style.display="block";
            }

            if(cond1 && cond2 ){
                produs.style.display="block";
            }

            
            let gramaj = produs.getElementsByClassName("val-gramaj")[0].innerHTML;
            if(document.getElementById("i_rad1").checked && parseInt(gramaj) <= val_superioara_rad1){
                cond3=true;
            }
            if(document.getElementById("i_rad2").checked && parseInt(gramaj) >= val_inferioara_rad2 && parseInt(gramaj) <= val_superioara_rad2){
                cond4=true;
            }
            if(document.getElementById("i_rad3").checked && parseInt(gramaj) >= val_inferioara_rad3){
                cond5=true;
            }
            if(document.getElementById("i_rad4").checked && parseInt(gramaj) <= 25000){
                cond6=true;
            }
            
            let pret = parseInt(produs.getElementsByClassName("val-pret")[0].innerHTML);
            if(pret<=inpPret){
                cond7=true;
            }
            if(document.getElementById("inp-voucher").checked===true && produs.getElementsByClassName("val-voucher")[0].innerHTML==="true"){
                cond8=true;
            }

            if(document.getElementById("inp-not-voucher").checked===true && produs.getElementsByClassName("val-voucher")[0].innerHTML==="false"){
                cond9=true;
            }

            /////////GRUP RADIO BUTTON CU ARE/NU ARE

            ////////////////__________ARE____________//////////
            if(document.getElementById("are").checked===true && document.getElementById("cuv-cheie-1").checked === true
            && (produs.getElementsByClassName("val-culori")[0].innerHTML.toLowerCase().trim()) === (document.getElementById("cuv-cheie-1").value.toLowerCase())){
                produs.style.display="block"
            }
            
            if(document.getElementById("are").checked===true && document.getElementById("cuv-cheie-2").checked === true
            && (produs.getElementsByClassName("val-culori")[0].innerHTML.toLowerCase().trim()) === (document.getElementById("cuv-cheie-2").value.toLowerCase())){
                produs.style.display="block"
            }
            
            if(document.getElementById("are").checked===true && document.getElementById("cuv-cheie-3").checked === true
            && (produs.getElementsByClassName("val-culori")[0].innerHTML.toLowerCase().trim()) === (document.getElementById("cuv-cheie-3").value.toLowerCase())){
                produs.style.display="block";
            }
            if(document.getElementById("are").checked===true && document.getElementById("cuv-cheie-4").checked === true
            && (produs.getElementsByClassName("val-culori")[0].innerHTML.toLowerCase().trim()) === (document.getElementById("cuv-cheie-4").value.toLowerCase())){
                produs.style.display="block"
            }

        
            ////////////////__________NU_ARE____________//////////
            if(document.getElementById("nu-are").checked===true){
                produs.style.display="block";
                if(document.getElementById("cuv-cheie-1").checked === true
                && (produs.getElementsByClassName("val-culori")[0].innerHTML.toLowerCase().trim()) === (document.getElementById("cuv-cheie-1").value.toLowerCase()))
                {
                    produs.style.display="none"
                }
                if(document.getElementById("cuv-cheie-2").checked === true
                && (produs.getElementsByClassName("val-culori")[0].innerHTML.toLowerCase().trim()) === (document.getElementById("cuv-cheie-2").value.toLowerCase()))
                {
                    produs.style.display="none"
                }
                if(document.getElementById("cuv-cheie-3").checked === true
                && (produs.getElementsByClassName("val-culori")[0].innerHTML.toLowerCase().trim()) === (document.getElementById("cuv-cheie-3").value.toLowerCase()))
                {
                    produs.style.display="none"
                }
                if(document.getElementById("cuv-cheie-4").checked === true
                && (produs.getElementsByClassName("val-culori")[0].innerHTML.toLowerCase().trim()) === (document.getElementById("cuv-cheie-4").value.toLowerCase()))
                {
                    produs.style.display="none"
                }

            }

            if (document.getElementById("quantity").value != '' ){
                if(garantie==parseInt(document.getElementById("quantity").value)){
                    produs.style.display="block"
                }
            }
            
            
            

           
            
            if(cond3 ){
                produs.style.display="block";
            }
            if(cond4){
                produs.style.display="block";
            }
            if(cond5){
                produs.style.display="block";
            }
            if(cond6){
                produs.style.display="block";
            }
            if(cond7){
                produs.style.display="block";
            }
            if(cond8){
                produs.style.display="block";
            }
            if(cond9){
                produs.style.display="block";
            }
            
            if(produs.style.display=="none"){
                counter++;
                }
            
            
        }

        
        if(counter==produse.length){
            // div_mistake.style.border = "1px solid purple";
            div_negasit = document.createElement("div");
            div_negasit.id = "inp-negasit"
            div_negasit.innerHTML="<b>Nu exista produse conform filtrarii cerute.</b>";
            var ps = document.getElementById("h2-produse");
            ps.parentNode.insertBefore(div_negasit, ps.nextSibling);
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
        document.getElementById("infoRange").innerHTML="(0)";
        document.getElementById("inp-garantie").value="";
        document.getElementById("i_rad1").checked=false;
        document.getElementById("i_rad2").checked=false;
        document.getElementById("i_rad3").checked=false;
        document.getElementById("i_rad4").checked=false;
        document.getElementById("exampleDataList").value="";
        try {
            document.getElementById("inp-negasit").style.display="none";
        } catch(e) {
            console.log(e)
        }
        document.getElementById("inp-not-voucher").checked=false;
        document.getElementById("cuv-cheie-1").checked=false;
        document.getElementById("cuv-cheie-2").checked=false;
        document.getElementById("cuv-cheie-3").checked=false;
        document.getElementById("cuv-cheie-4").checked=false;
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
    window.onkeydown=function(e){
        console.log("key down");
        if (e.key == 'c'){
            var produse=document.getElementsByClassName("produs");
            let suma = 0
            for (let prod of produse){
                if (prod.style.display != "none")
                suma += parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML);
            }
            if(!document.getElementById("rez")){
            rezultat = document.createElement("p");
            rezultat.id = "rez"
            rezultat.innerHTML="<b>Pret total:</b> "+suma;
            var ps = document.getElementById("p-suma");
            ps.parentNode.insertBefore(rezultat, ps.nextSibling);
            rezultat.style.border = "1px solid purple";
            rezultat.style.position = "fixed";
            rezultat.onclick = function(){
                this.remove();
            }
            // setTimeout(function () {
            //     document.getElementById("rez").remove()
            // })
            }
        }
    }

    document.getElementById("btn-suma").onclick=function(){
        //resteare produse
        var produse=document.getElementsByClassName("produs");
            let suma = 0
            for (let prod of produse){
                if (prod.style.display != "none"){
                    suma += parseInt(prod.getElementsByClassName("val-pret")[0].innerHTML);
                }
            }
            if(!document.getElementById("rez")){
                rezultat = document.createElement("div");
                rezultat.id = "rez"
                rezultat.innerHTML="<b>Pret total:</b> "+suma;
                var ps = document.getElementById("p-suma");
                ps.parentNode.insertBefore(rezultat, ps.nextSibling);
                rezultat.style.border = "1px solid purple";
                rezultat.style.position = "relative";
                rezultat.onclick = function(){
                    this.remove();
                }
                setTimeout(function () {
                    document.getElementById("rez").remove()
                }, 10000);
        }

    }


    /////////////ONCHANGE

    document.getElementById("quantity").onkeydown=document.getElementById("quantity").onchange=function(){
        var produse=document.getElementsByClassName("produs");
        for (let produs of produse){
            produs.style.display="none";
            let garantie = produs.getElementsByClassName("val-garantie")[0].innerHTML;
            if (document.getElementById("quantity").value != '' ){
                if(garantie==parseInt(document.getElementById("quantity").value)){
                    produs.style.display="block"
                }
            }
        }
    }

    document.getElementById("inp-garantie").onchange=function(){
        var selected = document.querySelectorAll('#inp-garantie option:checked');
        var values = Array.from(selected).map(el => el.value);
        var produse=document.getElementsByClassName("produs");

        for (let produs of produse){
            produs.style.display="none"
        let garantie = produs.getElementsByClassName("val-garantie")[0].innerHTML;
            if (values.includes(garantie)){
                produs.style.display="block";
            }
        }
    }

    document.getElementById("inp-voucher").onchange=function(){
        var produse=document.getElementsByClassName("produs");
        for (let produs of produse){
            produs.style.display="none"
            if(document.getElementById("inp-voucher").checked===true && produs.getElementsByClassName("val-voucher")[0].innerHTML==="true"){
                produs.style.display="block";
            }
        }
    }

    document.getElementById("i_rad1").onchange=function(){
        var produse=document.getElementsByClassName("produs");
        var val_superioara_rad1 = parseInt(document.getElementById("i_rad1").value.replace('0:', ''));
        for (let produs of produse){
            produs.style.display="none"
            let gramaj = produs.getElementsByClassName("val-gramaj")[0].innerHTML;

            if(document.getElementById("i_rad1").checked && parseInt(gramaj) < val_superioara_rad1){
                produs.style.display="block"
            }
        }
    }

    document.getElementById("i_rad2").onchange=function(){
        var produse=document.getElementsByClassName("produs");
        var inpRad2 = document.getElementById("i_rad2").value;
        var val_inferioara_rad2 = inpRad2.split(":")[0];
        var val_superioara_rad2 = inpRad2.split(":")[1];

        for (let produs of produse){
            produs.style.display="none"
            let gramaj = produs.getElementsByClassName("val-gramaj")[0].innerHTML;
            if(document.getElementById("i_rad2").checked && parseInt(gramaj) >= val_inferioara_rad2 && parseInt(gramaj) <= val_superioara_rad2){
                produs.style.display="block"
            }
        }
    }

    document.getElementById("i_rad3").onchange=function(){
        var produse=document.getElementsByClassName("produs");
        var inpRad3 = document.getElementById("i_rad3").value;
        var val_inferioara_rad3 = parseInt(inpRad3.split(":")[0]);
        for (let produs of produse){
            produs.style.display="none"
            let gramaj = produs.getElementsByClassName("val-gramaj")[0].innerHTML;

            if(document.getElementById("i_rad3").checked && parseInt(gramaj) >= val_inferioara_rad3){
                produs.style.display="block"
            }
        }
    }

    
    document.getElementById("exampleDataList").onkeydown=document.getElementById("exampleDataList").onchange=function(){
        document.getElementById("exampleDataList").value;
        datalist_values = document.getElementById("exampleDataList").value;
        var produse=document.getElementsByClassName("produs");
        for (let produs of produse){
            produs.style.display="none"
            if (produs.getElementsByClassName("val-tip")[0].innerHTML === datalist_values ){
                produs.style.display="block";
            }
        }
    }

    document.getElementById("inp-categorie").onchange=function(){
        var produse=document.getElementsByClassName("produs");
        for (let produs of produse){
            produs.style.display="none"
            let categorie= produs.getElementsByClassName("val-categorie")[0].innerHTML;

            if(categorie==document.getElementById("inp-categorie").value){
                produs.style.display="block"
            }
        }
    }

    document.getElementById("inp-pret").onchange=function(){
        document.getElementById("infoRange").innerHTML = `(${this.value})`
        inpPret=parseInt(document.getElementById("inp-pret").value);
        var produse = document.getElementsByClassName("produs");
        for (let produs of produse){
            produs.style.display="none"
            let pret = parseInt(produs.getElementsByClassName("val-pret")[0].innerHTML);
                if(pret<=inpPret){
                    produs.style.display="block"
                }
        }
    }

    document.getElementById("inp-nume").onkeydown=document.getElementById("inp-nume").onchange=function(){
        condValidare = true;
        inpNume = document.getElementById("inp-nume").value.toLowerCase().trim();
        condValidare = condValidare && inpNume.match(new RegExp("^[a-zA-Z]*$"))
        if (!condValidare){
            alert("Inputuri gresite!");
            document.querySelector("#inp-nume").className = "form-control is-invalid"
            return;
        } else {
            document.querySelector("#inp-nume").className = "form-control"

        } 
        var produse = document.getElementsByClassName("produs");
        for(let produs of produse){
            produs.style.display="none"
            let nume= produs.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase().trim();
            if(nume.includes(inpNume) && inpNume.length != 0){
                produs.style.display="block"
            }
        }
    }

})