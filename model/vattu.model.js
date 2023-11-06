const mongooge = require("mongoose")
const Schema = mongooge.Schema
const schema = new Schema({
    Ma_vattu: {type: String, required: true},
    Tenvattu: {type: String, required: false},
    Loaivattu: {type: String, required: false},
})


module.exports = mongooge.model('vattu', schema, 'vattu')