const AccesBD=require('./accesbd.js');
const crypto = require("crypto")
const nodemailer = require("nodemailer");
const parole = require("./parole.js")
const {RolFactory} = require("./roluri.js")

class Utilizator{
    static tipConexiune="local";
    static tabel = "utilizatori";
    static parolaCriptare = "tehniciWeb";
    static emailServer="stefvnf@gmail.com";
    static lungimeCod = 64;
    static numeDomeniu  = "localhost:3000";
    #eroare;
    //oeknulgndjugvhoy
    constructor({id, username, nume, prenume, email, parola, rol, data_nasterii, ocupatie, culoare_chat="black", confirmat_mail=false, poza}={}) {
        this.id=id;
        try{
            if (this.checkUsername(username))    {this.username = username;}
            if (this.checkPrenume(prenume))     {this.prenume=prenume;}
        }
        catch(e) {this.#eroare=e.message}

        for(let prop in arguments[0]){
            this[prop]=arguments[0][prop]
        }
        if(this.rol){
        this.rol=this.rol.cod? RolFactory.creeazaRol(this.rol.cod): RolFactory.creeazaRol(this.rol)
        }
        
    }

    checkName(nume){
        return nume!='' && nume.match(new RegExp("^[a-zA-Z\\s-]+$"))
    }

    checkPrenume(prenume){
        return prenume != '' && prenume.match(new RegExp("^[a-zA-Z\\s-]+$"))
    }

    set setareNume(nume){
        if (this.checkName(nume)) this.nume=nume;
        else {
            throw new Error("nume gresit");
        }
    }
    /*
    * folosit doar la inregistrare si modificare profil
    */
    set setareUsername(username){
        if (this.checkUsername(username)) this.username=username;
        else {
            throw new Error("username gresit");
        }
    }

    set setarePrenume(prenume){
        if (this.checkPrenume(prenume))  this.prenume=prenume;
        else {
            throw new Error("prenume gresit");
        }
    }


    checkUsername(usernume){
        return usernume!='' && usernume.match(new RegExp("^[A-Za-z0-9]+$"))
    }

    static criptareParola(parola){
        return crypto.scryptSync(parola, Utilizator.parolaCriptare, Utilizator.lungimeCod).toString("hex");
    }

    verificaConfirmare(){
        let utiliz = this;
        AccesBD.getInstanta(Utilizator.tipConexiune).select({tabel:"utilizatori", campuri:['*'], conditiiAnd:[`username='${this.username}'`,'confirmat_mail=false']}, function(err, rez){
            if(err)
                console.log(err)
                utiliz.trimiteMail("Confirmare cont", "Nu uita sa confirmi contul te rog",
            `<h1>Salut!</h1><p style='color:blue'>Salut, ${utiliz.username}. Nu uita te rog sa confirmi contul te rugam. Multumim!</p>`)
                    console.log("confimare mail")  
        })
    }

    salvareUtilizator(){
        let parolaCriptata = Utilizator.criptareParola(this.parola)
        let utiliz = this;
        let token = parole.genereazaToken(40);
        let confirmatMail = false
        AccesBD.getInstanta(Utilizator.tipConexiune).insert({tabel:Utilizator.tabel, campuri:["username", "nume", "prenume", "parola", "email", 
                "data_nasterii", "ocupatie", "culoare_chat", "cod", "confirmat_mail", "cale_imagine"], valori:[`'${this.username}'`,`'${this.nume}'`,`'${this.prenume}'`,`'${parolaCriptata}'`,
                `'${this.email}'`,`'${this.data_nasterii}'`, `'${this.ocupatie}'`, `'${this.culoare_chat}'`, `'${token}'`, `'${confirmatMail}'`,`'${this.poza}'`]}, function(err,rez){
                    if(err){
                    console.log("AAAAAAAA=======",err);
                }
                if(!err)
                utiliz.trimiteMail("Te-ai inregistrat cu succes", "Username-ul tau este " + utiliz.username,
                `<h1>Salut!</h1><p style='color:blue'>Username-ul tau este <b style="color:green">${utiliz.username}</b>.</p> <p><a href='http://${Utilizator.numeDomeniu}/cod/${utiliz.username}/${token}'>Click aici pentru confirmare</a></p>`)
            })
    }

    stergereUtilizator(){
        AccesBD.getInstanta(Utilizator.tipConexiune).delete({tabel:Utilizator.tabel, conditiiAnd:[`username='${this.user}'`]}, function(err, rez){
            if(err || rez.rowCount==0)
                console.log(err)
                throw new Error()
        })
    }

  


    async trimiteMail(subiect, mesajText, mesajHtml, atasamente=[]){
        var transp= nodemailer.createTransport({
            service: "gmail",
            secure: false,
            auth:{//date login 
                user:Utilizator.emailServer,
                pass:"oeknulgndjugvhoy"
            },
            tls:{
                rejectUnauthorized:false
            }
        });
        //genereaza html
        await transp.sendMail({
            from:Utilizator.emailServer,
            to:this.email, //TO DO
            subject:subiect,//"Te-ai inregistrat cu succes",
            text:mesajText, //"Username-ul tau este "+username
            html: mesajHtml,// `<h1>Salut!</h1><p style='color:blue'>Username-ul tau este ${username}.</p> <p><a href='http://${numeDomeniu}/cod/${username}/${token}'>Click aici pentru confirmare</a></p>`,
            attachments: atasamente
        })
        console.log("trimis mail");
    }

    static async modificaAsync(obParam, obConditii=[]){ //{confirmat_mail: true}
        if (!obParam) return null;
        
        try{
            var listaConditiiAnd = [];
            var listaUtiliz = []; 
            for (let prop in obConditii){
                listaConditiiAnd.push(`${prop} = '${obConditii[prop]}'`)
            }
            let rezCauta = await AccesBD.getInstanta(Utilizator.tipConexiune).updateAsync({tabel:"utilizatori", 
                                                        campuri:Object.keys(obParam), 
                                                        valori:Object.values(obParam), 
                                                        conditiiAnd:listaConditiiAnd})
            // UPDATE table_name
            // SET column1 = value1, column2 = value2, ...
            // WHERE condition;
            //
            //

            if(rezCauta.rowCount != 0){
                for (var i=0;i<rezCauta.rowCount;i++){
                let u = new Utilizator(rezCauta.rows[i])
                listaUtiliz.push(u)
                }
                return listaUtiliz
            }
        }
        catch(e) {
            console.log(e)
            console.log("cautaAsync: Nu am gasit utilizatorul")
            return null;
        }
    }
   

    static getUtilizDupaUsername (username,obparam, proceseazaUtiliz){
        if (!username) return null;
        let eroare=null;
        AccesBD.getInstanta(Utilizator.tipConexiune).select({tabel:"utilizatori",campuri:['*'],conditiiAnd:[`username='${username}'`]}, function (err, rezSelect){
            if(err){
                console.error("Utilizator:", err);
                console.log("Utilizator",rezSelect.rows.length);
                //throw new Error()
                eroare=-2;
            }
            else if(rezSelect.rowCount==0){
                eroare=-1;
            }
            //constructor({id, username, nume, prenume, email, rol, culoare_chat="black", poza}={})
            let u= new Utilizator(rezSelect.rows[0])
            proceseazaUtiliz(u, obparam, eroare);
        });
    }

    static async getUtilizDupaUsernameAsync(username){
        if (!username) return null;
        try{
            let rezSelect = await AccesBD.getInstanta(Utilizator.tipConexiune).selectAsync({tabel:"utilizatori", campuri:['*'], conditiiAnd:[`username='${username}'`]})
        
        if (rezSelect.rowCount!=0){
            let u = new Utilizator(rezSelect.rows[0])
             return u;
        }
        } catch(e){
            console.log("getUtilizDupaUsernameAsync: Nu am gasit utilizatorul");
            return null;
        }
        
    }
    static cauta(obParam, proceseazaUtiliz){
        var listaConditiiAnd = [];
        for (let prop in obParam){
            listaConditiiAnd.push(`${prop} = '${obParam[prop]}'`)
        }
         AccesBD.getInstanta(Utilizator.tipConexiune).selectAsync({tabel:"utilizatori", campuri:['*'], conditiiAnd:listaConditiiAnd}, function(err, listaUtiliz){
            if(err){
                console.error("Utilizator:", err);
                console.log("Utilizator",rezSelect.rows.length);
                //throw new Error()
                eroare=-2;
            }
            else if(rezSelect.rowCount==0){
                eroare=-1;
            }
            //constructor({id, username, nume, prenume, email, rol, culoare_chat="black", poza}={})
            listaUtiliz=[];
            for (var i=0;i<rezCauta.rowCount;i++){
                let u = new Utilizator(rezCauta.rows[i])
                listaUtiliz.push(u)
            }
            proceseazaUtiliz(listaUtiliz, eroare);
         })
            
    }

    static async cautaAsync(obParam){
        if (!obParam) return null;
        
        try{
            var listaConditiiAnd = [];
            var listaUtiliz = []; 
            for (let prop in obParam){
                listaConditiiAnd.push(`${prop} = '${obParam[prop]}'`)
            }
            let rezCauta = await AccesBD.getInstanta(Utilizator.tipConexiune).selectAsync({tabel:"utilizatori", campuri:['*'], conditiiAnd:listaConditiiAnd})
            
            if(rezCauta.rowCount != 0){
                for (var i=0;i<rezCauta.rowCount;i++){
                let u = new Utilizator(rezCauta.rows[i])
                listaUtiliz.push(u)
                }
                return listaUtiliz
            }
        }
        catch(e) {
            console.log(e)
            console.log("cautaAsync: Nu am gasit utilizatorul")
            return null;
        }
    }
    areDreptul(drept){
        return this.rol.areDreptul(drept)
    }
}

module.exports={Utilizator:Utilizator}