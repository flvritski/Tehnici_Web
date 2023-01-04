const id = Symbol("id");

const ADMIN = Symbol("Admin");
const MODERATOR = Symbol("Moderator");
const CLIENT = Symbol("Client");


const createProdus = Symbol("createProdus")
const readProdus = Symbol("readProdus")
const updateProdus = Symbol("updateProdus")
const deleteProdus = Symbol("deleteProdus")
const createUser = Symbol("createUser")
const readUser = Symbol("readUser")
const updateUser = Symbol("updateUser")
const deleteUser = Symbol("deleteUser")
const canPurchase = Symbol("canPurchase")

drepturi = [
  {  
    [id]: ADMIN,
    name: ADMIN.description,
    rights: [createProdus.description, readProdus.description, updateProdus.description, deleteProdus.description,
         createUser.description, readUser.description, updateUser.description, deleteUser.description, 
         canPurchase.description]
  },
  {
    [id]: MODERATOR,
    name: MODERATOR.description,
    rights: [createUser.description, readUser.description, updateUser.description, deleteUser.description]
  },
  {
    [id]: CLIENT,
    name: CLIENT.description,
    rights: [canPurchase.description]
  }
]


module.exports = drepturi

