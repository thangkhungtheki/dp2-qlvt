const mongoose = require('mongoose');

const checkpointSchema = new mongoose.Schema({
    qrCode: { type: String },
    checkpointName: { type: String },
    
    // ĐỔI TÊN thành anhthuchien và khai báo dạng mảng chứa chuỗi (Array of Strings)
    anhthuchien: [{ type: String }], 
    
    time: { type: String },
    comment: { type: String, default: "" },
    timestamp: { type: Date }
});

const patrolSchema = new mongoose.Schema({
    guardId: { type: String },
    guardCode: { type: String, required: true },
    guardName: { type: String, required: true },
    selfie: { type: String },  // Ảnh nhận ca
    startTime: { type: String },
    endTime: { type: String },
    totalPoints: { type: Number, default: 0 },
    checkpoints: [checkpointSchema],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Patrol', patrolSchema);