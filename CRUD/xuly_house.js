const housemodem = require('../model/house.model')

async function them(doc){
    //console.log(doc)
    try{
        await housemodem.create(doc)
        return true
    }catch(e){
        return false
    }
}

async function xoa(id) { 
     try {
        await housemodem.deleteOne({_id: id})
        return true
    } catch (error) {
        return error
    }
 }

async function sua(id, doc) {
     try{
        await housemodem.findByIdAndUpdate(id, doc)
        return true
    }catch(e){
        return false
    }
}

async function updatehoanthanh(id, trangthai) {
    try{
       await housemodem.findByIdAndUpdate(id, {$set:{hoanthanh: trangthai}})
       return true
   }catch(e){
       return false
   }
}

async function xulycronjoblaplai(id, doc) {
    try{
       await housemodem.findByIdAndUpdate(id, doc)
       return true
   }catch(e){
       return false
   }
}

async function tim(){
    try{
        const docs = await housemodem.find()
        return docs
    }catch(e){
        return false
    }
}
async function timid(id){
    try{
        const docs = await housemodem.find({_id: id})
        //console.log(docs)
        return docs
    }catch(e){
        return false
    }
}



module.exports = {
    them,
    xoa, 
    sua,
    tim,
    timid,
    updatehoanthanh,
    xulycronjoblaplai
}