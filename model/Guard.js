const mongoose = require('mongoose');

const guardSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true }, // Mã NV (VD: DP-001)
    name: { type: String, required: true },               // Tên NV
    role: { type: String, default: 'Bảo vệ' },            // Chức vụ
    isActive: { type: Boolean, default: true }            // Trạng thái làm việc
}, { timestamps: true });

module.exports = mongoose.model('Guard', guardSchema);