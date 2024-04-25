const mongooge = require("mongoose")
const Schema = mongooge.Schema
const schema = new Schema({
    tenthietbi: {type: String, required: false},
    vitri: {type: String, required: false},
    congsuat: {type: Number, required: false},
    model: {type: String, required: false},
    dienap: {type: String, required: false},
    ghichu: {type: String, required: false}
})


module.exports = mongooge.model('dongco', schema, 'dongco')