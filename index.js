const express = require('express');
const ejs = require('ejs');
const sass = require('sass');
const {Client} = require('pg');
const {Utilizator} = require('./module_proprii/utilizator.js')
const AccesBD = require("./module_proprii/accesbd.js")
const path=require('path');
const Drepturi = require("./module_proprii/drepturi.js")
const QRCode = require('qrcode')
const puppeteer = require('puppeteer');
const mongodb=require('mongodb');
var ip = require('ip');
const fs=require("fs");
const formidable=require("formidable");
const session = require("express-session");


const foldere = ["temp", "poze_uploadate"]
for (let folder of foldere){
  let calefolder = path.join(__dirname,folder)
  if(!fs.existsSync(calefolder))
  fs.mkdirSync(calefolder);
}

var cssBootstrap = sass.compile(__dirname + "/views/resurse/scss/customizare-bootstrap.scss", {sourceMap:true});
fs.writeFileSync(__dirname + "/views/resurse/css/biblioteci/customizare-bootstrap.css", cssBootstrap.css);
const sharp = require('sharp');
const e = require('express');

// var client = new Client({database: "florinstefan",
//   user: "florinstefan",
//   password: "1234",
//   host: "localhost",
//   port: 5432
// });
// client.connect();
var instantaBD = AccesBD.getInstanta({init:"local"});
var client = instantaBD.getClient();
instantaBD.select({campuri: ["nume", "pret"], tabel: "instrumente", conditiiAnd: ["pret>10", "pret<1000"]}, function(err,rez){
  if(err)
  console.log(err)
  else
    console.log(rez)
})



const app = express();
app.use(["/produse_cos", "/cumpara"], express.json({limit:'2mb'})) //pt cosul virtual ca sa primeasca in obiect de tip json

app.use(session({
  secret: 'abcdefg',
  resave:true,
  saveUninitialized: false
}));


app.set("view engine", "ejs");

app.use("/resurse", express.static(__dirname+"/views/resurse"));
app.use("/node_modules", express.static(__dirname+"/node_modules"));
app.use("/poze_uploadate", express.static(__dirname+"/poze_uploadate"));



app.use("/*", function(req,res,next){
  res.locals.Drepturi = Drepturi;
  if(req.session.utilizator){
    req.utilizator = res.locals.utilizator = new Utilizator(req.session.utilizator);
  }
  
  next()
});

function getIp(req){
  var ip = req.headers["x-forwaded-for"]
  if (ip){
    let vect = ip.split(",");
    return vect[vect.length-1]
  }
  else if (req.ip){
    return req.ip
  }
  else {
    return req.connection.remoteAddress;
  }
}

app.all("/*", function(req, res, next){
  let id_utiliz = req?.session?.utilizator?.id;
  id_utiliz=id_utiliz?id_utiliz:null;
  AccesBD.getInstanta().insert({
    tabel: "accesari",
    campuri:["ip", "user_id", "pagina"],
    valori:[`'${getIp(req)}'`, `${id_utiliz}`, `'${req.url}'`]
  }, function(err, rezQuery){
    console.log(err)
  })
  next();
});

function stergeAccesariVechi(){
  AccesBD.getInstanta().delete({tabel:"accesari", conditiiAnd:["now() - data_accesare >= interval '10 minutes' "]}, function(err, rez){
    console.log(err)
  })
}
stergeAccesariVechi();

setInterval(stergeAccesariVechi, 10*60*1000)

obGlobal={
  erori:null,
  imagini:[],
  imagini_random:[],
  protocol: "http://",
  numeDomeniu: "localhost:3000",
  clienMongo: mongodb.MongoClient,
  bdMongo: null
}

var url="mongodb+srv://stefan123:amxazx@cluster0.axrcg.mongodb.net/test";
obGlobal.clienMongo.connect(url, function(err, bd){
  if(err) console.log(err)
  else {
    obGlobal.bdMongo = bd.db("tehnici_web");
  }
})



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

app.get(["/", "/index", "/home", "/login"], function(req,res,next){
  let sir = req.session.succesLogin
  req.session.succesLogin=null
  client.query("select username, nume, prenume from utilizatori where id in (select distinct user_id from accesari where now()-data_accesare <= interval '5 minutes')",
  function(err, rez){
      let useriOnline=[];
      if(!err && rez.rowCount!=0)
          useriOnline=rez.rows

      res.render("pagini/index", {ip: req.ip, imagini:obGlobal.imagini, succesLogin:sir, useriOnline:useriOnline});

  });

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
      obiecte_garantie = rez.rows.sort((a,b) => a.garantie - b.garantie);
      obiecte_pret = rez.rows.sort((a,b) => a.pret - b.pret);
      res.render("pagini/produse", {produse: rez.rows, optiuni: rezCateg.rows, val1: obiecte_gramaj[4].gramaj, val2: obiecte_gramaj[12].gramaj, val3: obiecte_gramaj[obiecte_gramaj.length - 1].gramaj,
                                          val4: obiecte_gramaj[obiecte_gramaj.length],
                                          garantie: rez.rows.filter((value, index, self) => index===self.findIndex((t)=> (
                                            t.garantie===value.garantie)
                                          )),
                                          garantie_limita_inferioara: obiecte_garantie[0].garantie, garantie_limita_superioara: obiecte_garantie[6].garantie,
                                          pret_limita_superioara: obiecte_pret[obiecte_pret.length-1].pret,
                                        tip_produs: rez.rows.filter((value, index, self) => index===self.findIndex((t)=> (
                                          t.tip_produs===value.tip_produs))),
                                        });
      console.log(obiecte_gramaj[4].gramaj,obiecte_gramaj[12].gramaj)
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

app.post("/produse_cos", function(req, res){
  console.log(req.body)
  if(req.body.ids_prod.length != 0){
    AccesBD.getInstanta().select({tabel:"instrumente", campuri:"nume, descriere, pret, gramaj, imagine".split(","), conditiiAnd:[`id in (${req.body.ids_prod})`]}, function(err, rez){
      if(err){
        res.send([])
      }
      else {
        res.send(rez.rows)
      }
    })
  }
  else {
    res.send([])
  }
});

async function genereazaPdf(stringHTML,numeFis, callback) {
  const chrome = await puppeteer.launch();
  const document = await chrome.newPage();
  console.log("inainte load")
  await document.setContent(stringHTML, {waitUntil:"load"});
  
  console.log("dupa load")
  await document.pdf({path: numeFis, format: 'A4'});
  // await chrome.close();
  if(callback)
      callback(numeFis);
}

function stergeFisierImagine(username){
  let folderUser=path.join(__dirname, "poze_uploadate", username);
  console.log(folderUser)
  fs.rmSync(folderUser, {force: true, recursive: true})
}

cale_qr="./views/resurse/imagini/qrcode";
if (fs.existsSync(cale_qr))
  fs.rmSync(cale_qr, {force:true, recursive:true});
fs.mkdirSync(cale_qr);
client.query("select id from instrumente", function(err, rez){
    for(let prod of rez.rows){
        let cale_prod=obGlobal.protocol+obGlobal.numeDomeniu+"/produs/"+prod.id;
        //console.log(cale_prod);
        QRCode.toFile(cale_qr+"/"+prod.id+".png",cale_prod);
    }
});

app.post("/cumpara",function(req, res){
  console.log(req.body);
  console.log("Utilizator:", req?.utilizator);
  console.log("Utilizator:", req?.utilizator?.rol?.areDreptul?.(Drepturi.cumparareProduse));
  console.log("Drept:", req?.utilizator?.areDreptul?.(Drepturi.cumparareProduse));
  if (req?.utilizator?.areDreptul?.(Drepturi.cumparareProduse)){
      AccesBD.getInstanta().select({
          tabel:"instrumente",
          campuri:["*"],
          conditiiAnd:[`id in (${req.body.ids_prod})`]
      }, function(err, rez){
          if(!err  && rez.rowCount>0){
              console.log("produse:", rez.rows);
              let rezFactura= ejs.render(fs.readFileSync("./views/pagini/factura.ejs").toString("utf-8"),{
                  protocol: obGlobal.protocol, 
                  domeniu: obGlobal.numeDomeniu,
                  utilizator: req.session.utilizator,
                  produse: rez.rows
              });
              console.log(rezFactura);
              let numeFis=`./temp/factura${(new Date()).getTime()}.pdf`;
              genereazaPdf(rezFactura, numeFis, function (numeFis){
                  mesajText=`Stimate ${req.session.utilizator.username} aveti mai jos factura.`;
                  mesajHTML=`<h2>Stimate ${req.session.utilizator.username},</h2> aveti mai jos factura.`;
                  req.utilizator.trimiteMail("Factura", mesajText,mesajHTML,[{
                      filename:"factura.pdf",
                      content: fs.readFileSync(numeFis)
                  }] );
                  res.send("Totul e bine!");
              });
              rez.rows.forEach(function (elem){ elem.cantitate=1});
              let jsonFactura= {
                  data: new Date(),
                  username: req.session.utilizator.username,
                  produse:rez.rows
              }
              if(obGlobal.bdMongo){
                  obGlobal.bdMongo.collection("facturi").insertOne(jsonFactura, function (err, rezmongo){
                      if (err) console.log(err)
                      else console.log ("Am inserat factura in mongodb");

                      obGlobal.bdMongo.collection("facturi").find({}).toArray(
                          function (err, rezInserare){
                              if (err) console.log(err)
                              else console.log (rezInserare);
                      })
                  })
              }
          }
      })
  }
  else{
      res.send("Nu puteti cumpara daca nu sunteti logat sau nu aveti dreptul!");
  }
  
});

app.get("/grafice", function(req,res){
  if (! (req?.session?.utilizator && req.utilizator.areDreptul(Drepturi.vizualizareGrafice))){
      renderError(res, 403);
      return;
  }
  res.render("pagini/grafice");

})

app.get("/update_grafice",function(req,res){
  obGlobal.bdMongo.collection("facturi").find({}).toArray(function(err, rezultat) {
      res.send(JSON.stringify(rezultat));
  });
})


////////Utilizatori

app.post("/inregistrare",function(req, res){
  var username;
  console.log("ceva");
  var formular= new formidable.IncomingForm()
  formular.parse(req, function(err, campuriText, campuriFisier ){//4
      console.log("Inregistrare:",campuriText);

      console.log(campuriFisier);
      var eroare="";

      var utilizNou=new Utilizator();
      try{
          utilizNou.setareNume=campuriText.nume;
          utilizNou.setareUsername=campuriText.username;
          utilizNou.email=campuriText.email
          utilizNou.setarePrenume=campuriText.prenume
          utilizNou.ocupatie=campuriText.ocupatie
          utilizNou.data_nasterii=campuriText.data_nasterii
          utilizNou.parola=campuriText.parola;
          utilizNou.culoare_chat=campuriText.culoare_chat;
          utilizNou.poza= campuriFisier.poza.originalFilename;
          Utilizator.getUtilizDupaUsername(campuriText.username, {}, function(u, parametru ,eroareUser ){
              if (eroareUser==-1){//nu exista username-ul in BD
                  utilizNou.salvareUtilizator();
              }
              else{
                  eroare+="Mai exista username-ul";
              }

              if(!eroare){
                  res.render("pagini/inregistrare", {raspuns:"Inregistrare cu succes!"})
                  
              }
              else
                  res.render("pagini/inregistrare", {err: "Eroare: "+eroare});
          })
          

      }
      catch(e){ 
          console.log(e.message);
          eroare+= "Eroare site; reveniti mai tarziu";
          console.log(eroare);
          res.render("pagini/inregistrare", {err: "Eroare: "+eroare})
      }
  



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
      let folderUser=path.join(__dirname, "poze_uploadate",username);
      console.log(folderUser);
      if (!fs.existsSync(folderUser))
          fs.mkdirSync(folderUser);
      fisier.filepath=path.join(folderUser, fisier.originalFilename)

  })    
  formular.on("file", function(nume,fisier){//3
      console.log("file");
      console.log(nume,fisier);
  }); 
});

app.post("/login", function(req,res){
  var username;
  var formular = new formidable.IncomingForm();
  formular.parse(req,function(err, campuriText, campuriFisier){
    Utilizator.getUtilizDupaUsername(campuriText.username, {
      req:req,
      res:res,
      parola: campuriText.parola
    }, function(u, obparam){
      let parolaCriptata = Utilizator.criptareParola(obparam.parola);
      if (u.parola == parolaCriptata && u.confirmat_mail == true){
        console.log(u.confirmat_mail)
        console.log(u.cale_imagine)
        u.cale_imagine=u.cale_imagine?path.join("poze_uploadate",u.username, u.cale_imagine):"";
        obparam.req.session.utilizator = u;
        obparam.req.session.succesLogin="Bravo, te-ai logat!"
        obparam.res.redirect("/index");
      }
      else{
        obparam.res.render("pagini/index", {eroareLogin: "Date logare incorecte sau nu a fost confirmat mail-ul!", imagini: obGlobal.imagini})
      }
    })
  })
})

app.get("/test", function(req,res){
  Utilizator.cauta({confirmat_mail: 'false'}, function(u, obparam){
    console.log('gasit');
  })
})

// {
// (async function(){
//   let u = await Utilizator.getUtilizDupaUsernameAsync("prof93099");
//   console.log("User Async: ", u)
// })()
// };

// {
//   (async function(){
//     let u = await Utilizator.cautaAsync({confirmat_mail: 'true'});
//     console.log("Cauta Async: ", u)
//   })()
// };

// {
//   (async function(){
//     let u = await Utilizator.modificaAsync({confirmat_mail: 'true'}, {username: 'prof53933'})
//     console.log("++++++++++++++++++++++++++",u);
//   })()
// }

// Utilizator.cauta({confirmat_mail: 'true'}, function(u, err){
//   if(err){
//     console.log(e)
//   }
//   else {
//     console.log(u)
//   }
// })

app.get("/cod/:username/:token", function(req, res){
  try {
    console.log("=========COD:", req.params);
  Utilizator.getUtilizDupaUsername(req.params.username, {res:res, token:req.params.token}, function(u, obparam){
    AccesBD.getInstanta().update({tabel:"utilizatori", campuri:['confirmat_mail'], valori:['true'], 
    conditiiAnd:[`cod='${obparam.token}'`]},
    function(err, rezUpdate){
      if(err || rezUpdate.rowCount == 0){
        renderError(res, 3)
      } else {
          res.render("pagini/confirmare.ejs")
        }
    })
  })
  } catch(e){
    renderError(res,2);
  }
})

app.post("/profil", function(req, res){
  console.log("profil");
  if (!req.session.utilizator){
      renderError(res,403,)
      res.render("pagini/403.ejs",{text:"Nu sunteti logat."});
      return;
  }
  var formular= new formidable.IncomingForm();

  formular.parse(req,function(err, campuriText, campuriFile){
     
      var parolaCriptata=Utilizator.criptareParola(campuriText.parola);
      AccesBD.getInstanta().update(
          {tabel:"utilizatori",
          campuri:["nume","prenume","email","culoare_chat"],
          valori:[`${campuriText.nume}`,`${campuriText.prenume}`,`${campuriText.email}`,`${campuriText.culoare_chat}`],
          conditiiAnd:[`parola='${parolaCriptata}'`]
      },  function(err, rez){
          if(err){
              console.log(err);
              randeazaEroare(res,2);
              return;
          }
          console.log(rez.rowCount);
          if (rez.rowCount==0){
              res.render("pagini/profil",{mesaj:"Update-ul nu s-a realizat. Verificati parola introdusa."});
              return;
          }
          else{            
              //actualizare sesiune
              console.log("ceva");
              req.session.utilizator.nume= campuriText.nume;
              req.session.utilizator.prenume= campuriText.prenume;
              req.session.utilizator.email= campuriText.email;
              req.session.utilizator.culoare_chat= campuriText.culoare_chat;
              res.locals.utilizator=req.session.utilizator;
              console.log(res.locals.utilizator)
          }


          res.render("pagini/profil",{mesaj:"Update-ul s-a realizat cu succes."});

      });
     

  });
});


/////////Administrare
app.get("/useri", function(req,res,next){
  if(req?.utilizator?.areDreptul?.(Drepturi.vizualizareUtilizatori)){
    AccesBD.getInstanta().select({tabel:"utilizatori", campuri:["*"]}, function(err, rezQuery){
      console.log(err)
      res.render("pagini/useri", {useri: rezQuery.rows})
    })
  } 
  else {
    renderError(res, 403)
  }
})

app.post("/sterge_utiliz", function(req,res){
  if(req?.utilizator?.areDreptul?.(Drepturi.stergereUtilizatori)){
    var formular = new formidable.IncomingForm()
    formular.parse(req,function(err, campuriText, campuriFile){
      AccesBD.getInstanta().delete({tabel:"utilizatori", conditiiAnd:[`id=${campuriText.id_utiliz}`]}, function(err){
        console.log(err)
        res.redirect("/useri")
      })
      stergeFisierImagine(campuriText.username_utiliz)

    })
    req.utilizator.trimiteMail("La revedere!", "La revedere!", "<h1>Salut!</h1><p style='color:blue'>Cu sincera parere de rau va anuntam ca ati fost sters! Adio!</p>");
  }
  else {
    renderError(res, 403)
  }
})

app.post("/profil-stergere", function(req,res){
  var formular = new formidable.IncomingForm()
    formular.parse(req,function(err, campuriText, campuriFile){
      let parolaCriptata = Utilizator.criptareParola(campuriText.pw)
      AccesBD.getInstanta().delete({tabel:"utilizatori", conditiiAnd:[`id=${req.session.utilizator.id}`, `parola='${parolaCriptata}'`]}, function(err){
        console.log(err)
        res.redirect("/index")
      })
    })
})

app.get("/toate_produsele", function(req,res){
  if(req?.utilizator?.areDreptul?.(Drepturi.vizualizareUtilizatori)){
    client.query("select * from instrumente", function(err, rez){
      if (err){
        console.log(err);
        renderError(res, 2);
      }
      else 
        res.render("pagini/toate_produsele", {instrumente: rez.rows});
      });
  } 
  else {
    renderError(res, 403)
  }  
})
app.post("/sterge_produse", function(req,res){
  if(req?.utilizator?.areDreptul?.(Drepturi.stergereProduse)){
    var formular = new formidable.IncomingForm()
    formular.parse(req,function(err, campuriText, campuriFile){
      client.query("delete from instrumente where id="+campuriText.id_produs, function(err,rez){
        console.log(err)
        res.redirect("/toate_produsele")
      })
    })
  }
  else {
    renderError(res, 403)
  }
})


app.get("/logout", function(req,res){
  req.session.destroy()
  res.locals.utilizator = null;
  res.render("pagini/logout");
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
