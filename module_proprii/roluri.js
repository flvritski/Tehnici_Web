const drepturi = require("./drepturi")


class Rol{
    constructor(cod){
        this.cod = cod
    }
    getRol(){
        return this.cod;
    }
    showRol(){
        console.log("Rolul meu este " + this.cod)
    }
    areDreptul(numeDrept){
        for (let drept in drepturi){
            if(drept.includes(numeDrept))
            return true
        }
        return false
    }

}

class RolClient extends Rol{
    constructor(rolClient){
        super(rolClient)
    }
    getRol(){
        return this.rolClient
    }
    showRol(){
        console.log("Rolul meu este " + this.rolClient)
    }
    getDrept(){

    }
}

class RolAdmin extends Rol{
    constructor(rolAdmin){
        super(rolAdmin)
    }
    getRol(){
        return this.rolAdmin
    }
    showRol(){
        console.log("Rolul meu este " + this.rolAdmin)
    }
}

class RolModerator extends Rol{
    constructor(rolModerator){
        super(rolModerator)
    }
    getRol(){
        return this.rolModerator
    }
    showRol(){
        console.log("Rolul meu este " + this.rolModerator)
    }
}