const mongooge = require("mongoose")
const Schema = mongooge.Schema
const schema = new Schema({
    ngay: {type: String, required: false},
    idcongviec: {type: String, required: false},
    phong: {type: String, required: false},
    noidung: {type: String, required: false},
    nguoithuchien: {type: String, required: false},
    imgthuchien: {type: Array, required: false},
    noidunglaychonhanh: {type: String, required: false},
    nguoikiemtra: {type: String, required: false},
    imgkiemtra: {type: Array, required: false},
    check: {type: String, required: false},
},
{
    timestamps: true // <--- THÊM DÒNG NÀY
})


module.exports = mongooge.model('house_cv_dinhky', schema, 'house_cv_dinhky')