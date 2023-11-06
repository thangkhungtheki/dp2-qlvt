const mongooge = require("mongoose")
const Schema = mongooge.Schema
const schema = new Schema({
    username: {type: String, required: true},
    tentb: {type: String, required: true},
    dvt: {type: String, required: false},
    soluong: {type: String, required: false},
    ngaynhap: {type: String, required: false},
    timehethan: {type: String, required: false},
    ngayhethan: {type: String, require: false},
    tenncc: {type: String, require: false},
    sdtncc: {type: String, require: false},
    tinhtrang: {type: String, require: false},
    ghichu: {type: String, required: false},
    songayhethan: {type: String, require: false}
})


module.exports = mongooge.model('createthietbi', schema, 'createthietbi')