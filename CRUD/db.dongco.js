const _dongco = require('../model/dongco.model')

async function doc_dongco(){
    let docs = await _dongco.find()
    return docs
}

module.exports = {
    doc_dongco,
}