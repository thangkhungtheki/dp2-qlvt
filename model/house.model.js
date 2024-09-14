const mongooge = require("mongoose")
const Schema = mongooge.Schema
const schema = new Schema({
    tencv: {type: String, required: true},
    vitricv: {type: String, required: false},
    ngaybatdau: {type: String, required: false},
    timehethan: {type: String, required: false},   //step bước số ngày từ này bắt đầu và ngày kết thúc (để dành lặp lại)
    ngayketthuc: {type: String, require: false},
    ngayguimail: {type: String, require: false},   //là số ngày bắt đầu gửi mail (ngày này là cố định) - tính từ ngày hiện tại đến ngày kết thúc
    ghichu: {type: String, required: false},        
    songayhethan: {type: String, require: false}, //được add vào mỗi lần gọi yc gửi api sendmail
    laplai: {type: String, require: false},
    hoanthanh: {type: String, require: false},
    flagguimail: {type: String, require: false},
})


module.exports = mongooge.model('house_cvdk', schema, 'house_cvdk')