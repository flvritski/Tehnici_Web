const express = require('express');
const ejs = require('ejs');
const sass = require('sass');
var ip = require('ip');
const fs=require("fs");
const sharp = require('sharp');

const app = express();




app.set("view engine", "ejs");

app.use("/resurse", express.static(__dirname+"/views/resurse"));

obGlobal={
  erori:null,
  imagini:null
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


app.get(["/", "/index", "/home"], function(req,res,next){
  res.render("pagini/index" , {ip: req.ip, imagini: obGlobal.imagini });
})

app.get("/*.ejs", function(req,res,next){
  renderError(res,403);
})

app.get("*/galerie-animata.css", function(req,res){
  var sirScss = fs.readFileSync(__dirname+"/resurse/scss/galerie_animata.scss").toString()
  var culori=["navy", "black", "purple", "grey"];
  var indiceAleator = Math.floor(Math.random()*culori.length);
  var culoareAleatoare = culori[indiceAleator];
  rezScss = ejs.render(sirScss, {culoare: culoareAleatoare});
  console.log(rezScss);
  var caleScss=__dirname+"/temp/galerie_animata.scss"
  fs.writeFileSync(caleScss, rezScss);
  try{
    rezCompilare = sass.compile(caleScss,{sourceMap:true});

    var caleCss = __dirname + "/temp/galerie_animata.css";
    fs.writeFileSync(caleCss, rezCompilare.css);
    res.setHeader("Content-Type", "text/css");
    res.sendFile(caleCss);
  }
  catch (err){
    console.log(err);
    res.send("Eroare");
  }
})

app.get("*/galerie-animata.css.map", function(req,res) {
  res.sendFile(path.join(__dirname, "temp/galerie-animata.css.map"));
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