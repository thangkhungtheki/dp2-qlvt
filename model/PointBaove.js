const mongoose = require('mongoose');

const pointBaoveSchema = new mongoose.Schema({
    khuvuc: { type: String, required: true },       // VD: Tầng 1, Hầm B1
    vitri: { type: String, required: true },        // VD: Hành lang C, Phòng kỹ thuật
    tencv: { type: String, required: true },        // VD: Chốt kiểm tra an ninh sảnh
    congviec: [{ type: String }],                   // Mảng: ['Kiểm tra cửa', 'Kiểm tra bình cứu hỏa']
    maqr: { type: String },                         // Mã QR gốc (Base64)
    maqrcochu: { type: String }                     // Mã QR có ghép chữ (Base64)
}, { timestamps: true });

module.exports = mongoose.model('PointBaove', pointBaoveSchema);