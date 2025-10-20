const modembaotrisua = require("../model/baotrisuachua")
async function doc_suachua(query){
    let docs = await modembaotrisua.find(query)
    return docs
}


async function create_suachua(doc){
    try{
        // console.log(doc)
        await modembaotrisua.create(doc)
        return true
    }catch(e){
        return false
    }
}

async function update_suachua(id, doc){
    
    try{
        await modembaotrisua.findByIdAndUpdate(id, doc)
        return true
    }catch(e){
        return false
    }
}


async function delete_suachua (id){
    try {
        await modembaotrisua.findByIdAndDelete(id)
    } catch (e) {
        
    }
}

module.exports = {
    doc_suachua,
    create_suachua,
    update_suachua,
    delete_suachua
}