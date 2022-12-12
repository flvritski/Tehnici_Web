const express = require('express');
const ejs = require('ejs');
const sass = require('sass');
const {Client} = require('pg');
const {Utilizator} = require('./module_proprii/utilizator.js')

var ip = require('ip');
const fs=require("fs");
const formidable=require("formidable");

var cssBootstrap = sass.compile(__dirname + "/views/resurse/scss/customizare-bootstrap.scss", {sourceMap:true});
fs.writeFileSync(__dirname + "/views/resurse/css/biblioteci/customizare-bootstrap.css", cssBootstrap.css);
const sharp = require('sharp');

var client = new Client({database: "florinstefan",
  user: "florinstefan",
  password: "1234",
  host: "localhost",
  port: 5432
});
client.connect();



const app = express();




app.set("view engine", "ejs");

app.use("/resurse", express.static(__dirname+"/views/resurse"));
app.use("/node_modules", express.static(__dirname+"/node_modules"));

obGlobal={
  erori:null,
  imagini:null,
  imagini_random:null
}


function createErrors(){
  var continutFisier=fs.readFileSync(__dirname+"/views/resurse/json/erori.json").toString("utf8");
  // console.log(continutFisier);
  obGlobal.erori=JSON.parse(continutFisier);
  //console.log(obErori.erori);
}
createErrors();




function createImages(){
  var continutFisier=fs.readFileSync(__dirname+"/views/resurse/json/galerie.json").toString("utf8");
  var obiect = JSON.parse(continutFisier);
  var dim_mediu = 200;
  var dim_mic = 100;
  // console.log(continutFisier);
  obGlobal.imagini=obiect.imagini;
  director = __dirname + '/views/' + obiect.cale_galerie;
  console.log(director)
  obGlobal.imagini.forEach(function (element){
    [numeFisier, extensie] = element.fisier.split(".");
    if (!fs.existsSync(director + '/mediu/')){
      fs.mkdirSync(director + '/mediu/');
    }
    element.fisier_mediu = obiect.cale_galerie + '/mediu/' + numeFisier +'.webp';
    element.fisier=obiect.cale_galerie + '/'+  element.fisier;
    sharp(__dirname + '/views/' + element.fisier).resize(dim_mediu).toFile(__dirname + '/views/' + element.fisier_mediu)
  });
  console.log(obGlobal.imagini);
}
createImages();

function renderError(res, identificator, titlu, text, imagine){
  var eroare = obGlobal.erori.info_erori.find(function(elem){
      return elem.identificator==identificator;
  })
  titlu= titlu || (eroare && eroare.titlu) || obGlobal.erori.eroare_default.titlu;
  text= text || (eroare && eroare.text) || obGlobal.erori.eroare_default.text;
  imagine= imagine || (eroare && obGlobal.erori.cale_baza+"/"+eroare.imagine) || obGlobal.erori.cale_baza+"/"+obGlobal.erori.eroare_default.imagine;
  if(eroare && eroare.status){
      res.status(identificator).render("pagini/eroare", {titlu:titlu, text:text, imagine:imagine})
  }
  else{
      res.render("pagini/eroare", {titlu:titlu, text:text, imagine:imagine});
  }
}
function compareNumbers(a, b) {
  return a - b;
}

app.get(["/", "/index", "/home"], function(req,res,next){
  res.render("pagini/index" , {ip: req.ip, imagini: obGlobal.imagini, imagini_random: obGlobal.imagini_random });
})

app.get("/produse", function(req, res){

  client.query("select * from unnest(enum_range(null::categ_instrument))", function(err, rezCateg){
    continuareQuery = "";
    if (req.query.tip)
    continuareQuery +=`and tip_produs='${req.query.tip}'`; //"tip='"+req.query.tip+"'"
    console.log(req.query.tip)
  client.query("select * from instrumente where 1=1 "+continuareQuery, function(err, rez){
    if (err) {
      console.log(err);
      renderError(res, 2);
    }
      else
      // set_garantie = new Set();
      // for(let i=0;i<rez.rows.length;i++){
      //   set_garantie.add(rez.rows[i].garantie)
      // }
      // // console.log(set_garantie)
      // lista_garantie = Array.from(set_garantie)
      // console.log(lista_garantie)
      
      obiecte_gramaj = rez.rows.sort((a,b) => a.gramaj - b.gramaj);
      res.render("pagini/produse", {produse: rez.rows, optiuni: rezCateg.rows, val1: obiecte_gramaj[4].gramaj, val2: obiecte_gramaj[11].gramaj, val3: obiecte_gramaj[obiecte_gramaj.length - 1].gramaj,
                                          val4: obiecte_gramaj[obiecte_gramaj.length],
                                          garantie: rez.rows.filter((value, index, self) => index===self.findIndex((t)=> (
                                            t.garantie===value.garantie)
                                          )),
                                        tip_produs: rez.rows.filter((value, index, self) => index===self.findIndex((t)=> (
                                          t.tip_produs===value.tip_produs))),
                                        });
    });
  });
});




app.get("/produs/:id", function(req,res){
    client.query("select * from instrumente where id="+req.params.id, function(err, rez){
    if (err){
      console.log(err);
      renderError(res, 2);
    }
    else 
      res.render("pagini/produs", {prod: rez.rows[0]});
    });
})

app.get("*/galerie-animata.css",function(req, res){

  var sirScss=fs.readFileSync(__dirname+"/views/resurse/scss/galerie_animata.scss").toString("utf8");
  var culori=["navy","black","purple","grey"];
  var numar_imagini = [7,8,9,11];
  var indiceAleator=Math.floor(Math.random()*culori.length);
  var culoareAleatoare=culori[indiceAleator]; 
  obGlobal.imagini_random = obGlobal.imagini
    .map(x=> ({x,r: Math.random()}))
    .sort((a,b) => a.r - b.r)
    .map(a => a.x)
    .slice(0, numar_imagini[indiceAleator]);
  
  console.log(obGlobal.imagini_random);

  rezScss=ejs.render(sirScss,{culoare:culoareAleatoare, nrimag:numar_imagini[indiceAleator]});
  console.log(rezScss);
  var caleScss=__dirname+"/views/temp/galerie_animata.scss"
  fs.writeFileSync(caleScss,rezScss);
  try {
      rezCompilare=sass.compile(caleScss,{sourceMap:true});
      
      var caleCss=__dirname+"/views/resurse/css/galerie_animata.css";
      console.log(caleCss);
      fs.writeFileSync(caleCss,rezCompilare.css);
      res.setHeader("Content-Type","text/css");
      res.sendFile(caleCss);
  }
  catch (err){
      console.log(err);
      res.send("Eroare");
  }
});



//////////////////Utilizatori
app.post("/inregistrare",function(req, res){
  var username;
  console.log("ceva");
  var formular= new formidable.IncomingForm()
  formular.parse(req, function(err, campuriText, campuriFisier ){
      console.log(campuriText);

      var eroare="";

      var utilizatorNou = new Utilizator();
      try{
        utilizatorNou.setareNume(campuriText.nume);
        utilizatorNou.setareUsername(campuriText.username)
      }
      catch(e) {
        eroare += e.message
      }

      if(!eroare){
         
      }
      else
          res.render("pagini/inregistrare", {err: "Eroare: "+eroare});
  });
  formular.on("field", function(nume,val){  // 1
 
      console.log(`--- ${nume}=${val}`);
     
      if(nume=="username")
          username=val;
  })
  formular.on("fileBegin", function(nume,fisier){ //2
      console.log("fileBegin");
     
      console.log(nume,fisier);
      //TO DO in folderul poze_uploadate facem folder cu numele utilizatorului

  })    
  formular.on("file", function(nume,fisier){//3
      console.log("file");
      console.log(nume,fisier);
  });
});



app.get("*/galerie-animata.css.map", function(req,res) {
  res.sendFile(path.join(__dirname, "/views/temp/galerie_animata.css.map"));
})

app.get("/*.ejs", function(req,res,next){
  renderError(res,403);
})





app.get("/*",function(req, res){
  console.log("url:",req.url);
  res.render("pagini"+req.url, function(err,rezRandare){
      if(err){
          if(err.message.includes("Failed to lookup view")){
              renderError(res,404);
          }
      }
      else{
          res.send(rezRandare);
      }


  });
});



app.get("/descriere", function(req,res,next){
  res.render("pagini/descriere");
})




//add the router
app.listen(process.env.port || 3000);

console.log('Running at Port 3000');
