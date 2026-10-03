const mongoose = require('mongoose');

const checkpointSchema = new mongoose.Schema({
    qrCode: { type: String },
    checkpointName: { type: String },
    image: { type: String }, // Lưu chuỗi Base64 hoặc đường dẫn ảnh
    time: { type: String },
    comment: { type: String, default: "" },
    timestamp: { type: Date }
});

const patrolSchema = new mongoose.Schema({
    guardId: { type: String }, // Có thể đổi thành mongoose.Schema.Types.ObjectId nếu cần
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