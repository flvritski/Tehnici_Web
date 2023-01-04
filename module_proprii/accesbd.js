const {Client} = require("pg");

class AccesBD{
    static #instanta = null;
    static #initializat = false;


    constructor (){
        if(AccesBD.#instanta){
            throw new Error("Deja a fost instantiat")
        }
        else if (!AccesBD.#initializat){
            throw new Error("Trebuie apelat doar din getInstanta; fara sa fi aruncat eroare");
        }
    }

    initLocal(){
        this.client = new Client({database: "florinstefan",
                        user: "florinstefan",
                        password: "1234",
                        host: "localhost",
                        port: 5432
                        });
        this.client.connect();
    }


    getClient(){
        if (!AccesBD.#instanta || AccesBD.#instanta == -1 ){
            throw new Error("nu a fost instantiata clasa");
        }
        return this.client;
    }

    static getInstanta({init="local"}={}){  // this-ul e clasa nu instanta pt ca metoda statica
        if(!this.#instanta){
            this.#initializat = true;
            this.#instanta = new AccesBD();
            try{
                switch(init){
                    case "local": this.#instanta.initLocal();
                }
            }
            catch (e){
                console.error("Eroare la initializarea bazei de date");
            }
        }
        return this.#instanta;
    }

    select({tabel="", campuri=[],conditiiAnd=[]} = {}, callback ){
        let conditieWhere = "";
        if (conditiiAnd.length > 0){
            conditieWhere=`where ${conditiiAnd.join(" and ")}`;
        }
        let comanda = `select ${campuri.join(",")} from ${tabel} ${conditieWhere}`;
        console.log(comanda)
        this.client.query(comanda,callback)
    } 


    insert({tabel="", campuri=[],valori=[]} = {}, callback ){
        if (campuri.length != valori.length){
            throw new Error("Numar campuri difera de nr de valori");
        }
        let comanda = `insert into ${tabel}(${campuri.join(",")}) values (${valori.join(",")}) `;
        console.log(comanda)
        this.client.query(comanda,callback)
    } 

    update({tabel="", campuri=[], valori=[], conditiiAnd=[]} = {}, callback){
        if (campuri.length != valori.length)
            throw new Error("Numarul de campuri difera de nr de valori");
        let campuriActualizate = [];
        for (let i=0;i<campuri.length;i++)
            campuriActualizate.push(`${campuri[i]}='${valori[i]}'`);
        let conditieWhere = "";
        if(conditiiAnd.length >0)
            conditieWhere=`where ${conditiiAnd.join(" and ")}`;
        let comanda = `update ${tabel} set ${campuriActualizate.join(", ")} ${conditieWhere}`;
        console.log(comanda);
        this.client.query(comanda, callback)
    }

    delete({tabel="", conditiiAnd=[]} ={}, callback){
        let conditieWhere="";
        if(conditiiAnd.length > 0)
            conditieWhere = `where ${conditiiAnd.join(" and ")}`;
        let comanda = `delete from ${tabel} ${conditieWhere}`;
        console.log(comanda);
        this.client.query(comanda, callback)
    }

    //selectAsync
    async selectAsync({tabel="", campuri=[], conditiiAnd=[]}){
        let conditieWhere = "";
        if (conditiiAnd.length > 0){
            conditieWhere=`where ${conditiiAnd.join(" and ")}`;
        }
        let comanda = `select ${campuri.join(",")} from ${tabel} ${conditieWhere}`;
        console.log("selectAsync: " , comanda)
        try{
            let rez = await this.client.query(comanda)
            console.log("selectAsync: ", rez)
            return rez;
        } catch (e){
            console.log(e)
            return null;
        }
    }

}

module.exports = AccesBD;