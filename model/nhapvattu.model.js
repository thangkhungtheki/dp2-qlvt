const mongooge = require("mongoose")
const Schema = mongooge.Schema
const schema = new Schema({
    Ma_vattu: {type: String, required: true},
    Tenvattu: {type: String, required: false},
    username: {type: String, required: false},
    ngaynhap: {type: String, required: false},
    soluong: {type: String, required: false},
    ghichu: {type: String, require: false},
    loai: {type: String, required: false},
})


module.exports = mongooge.model('nhapvattu', schema, 'nhapvattu')