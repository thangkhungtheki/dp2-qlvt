const mongooge = require("mongoose")
const Schema = mongooge.Schema
const schema = new Schema({
    mayeucau: {type: String, required: true},
    nguoiyeucau: {type: String, required: true},
    ngayyeucau: {type: String, required: true},
    bophan: {type: String, required: false},
    dienthoai: {type: String, required: false},
    vitri: {type: String, required: true},
    khancap: {type: String, required: false},
    mota: {type: String, required: true},
    ttbp: {type: String, required: false},
    trangthai: {type: String, required: false},
    motacongviec: {type: String, required: false},
    note: {type: String, required: false},
    filename: {type: Array, required: false},
    motakythuat: {type: String, require: false},
    fileanhdonhang: {type: Array, required: false},
    ngayhoanthanh:{type: String, required: false},
    feedback: {type: String, required: false},
    diem: {type: Number, required: false}
})


module.exports = mongooge.model('yeucausuachua', schema, 'yeucausuachua')