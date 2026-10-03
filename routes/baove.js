const express = require('express');
const router = express.Router();
const Guard = require('../model/Guard');
const Patrol = require('../model/Patrol');

// ==========================================
// 1. GET /api/dp3/baove/guards
// Lấy danh sách bảo vệ để hiển thị lên App
// ==========================================
router.get('/guards', async (req, res) => {
    try {
        const guards = await Guard.find({ isActive: true }).select('-__v');
        res.status(200).json(guards);
    } catch (error) {
        console.error("Lỗi lấy danh sách bảo vệ:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
});

// ==========================================
// 2. POST /api/dp3/baove/patrols
// Lưu dữ liệu ca tuần tra từ App gửi lên
// ==========================================
router.post('/patrols', async (req, res) => {
    try {
        const { 
            guardId, guardCode, guardName, selfie, 
            startTime, endTime, totalPoints, checkpoints, createdAt 
        } = req.body;

        // Lưu trực tiếp vào MongoDB
        // Lưu ý: Đang lưu Base64 trực tiếp. Ở bản Production thực tế, 
        // anh nên viết thêm hàm decode Base64 thành file .jpg lưu vào ổ cứng/S3 rồi mới lưu link vào DB.
        const newPatrol = new Patrol({
            guardId,
            guardCode,
            guardName,
            selfie,
            startTime,
            endTime,
            totalPoints,
            checkpoints,
            createdAt: createdAt || new Date()
        });

        const savedPatrol = await newPatrol.save();

        res.status(201).json({ 
            success: true, 
            message: "Đã lưu ca tuần tra thành công!",
            data: savedPatrol._id
        });

    } catch (error) {
        console.error("Lỗi lưu ca tuần tra:", error);
        res.status(500).json({ message: "Lỗi server khi lưu báo cáo", error: error.message });
    }
});

// ==========================================
// 3. POST /api/dp3/baove/guards/seed (API ẨN)
// Dùng để tạo nhanh vài dữ liệu bảo vệ mẫu (Chạy 1 lần qua Postman)
// ==========================================
router.post('/guards/seed', async (req, res) => {
    try {
        const guards = [
            { code: 'DP-001', name: 'Nguyễn Văn Nam', role: 'Đội Trưởng' },
            { code: 'DP-002', name: 'Trần Đình Trọng', role: 'Bảo vệ' },
            { code: 'DP-003', name: 'Lê Hoàng Long', role: 'Bảo vệ' }
        ];
        await Guard.insertMany(guards);
        res.json({ message: "Đã tạo dữ liệu bảo vệ mẫu thành công!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;