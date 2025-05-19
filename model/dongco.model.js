const mongooge = require("mongoose")
const Schema = mongooge.Schema
const schema = new Schema({
    tenthietbi: {type: String, required: false},
    loai: {type: String, required: false},
    ngaymua: {type: String, required: false},
    ngayhethan: {type: String, required: false},
    vitri: {type: String, required: false},
    congsuat: {type: String, required: false},
    model: {type: String, required: false},
    dienap: {type: String, required: false},
    ghichu: {type: String, required: false},
    maqr: {type: String, require: false}
})


module.exports = mongooge.model('dongco', schema, 'dongco')