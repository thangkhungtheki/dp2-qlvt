const mongooge = require("mongoose")
const Schema = mongooge.Schema
const schema = new Schema({
    ngay: {type: String, required: false},
    idthietbi: {type: String, required: false},
    phong: {type: String, required: false},
    noidung: {type: String, required: false},
    nguoithuchien: {type: String, required: false},
    anh: {type: Array, required: false},
    noidunglaychonhanh: {type: String, required: false},
})


module.exports = mongooge.model('baotrisuachua', schema, 'baotrisuachua')