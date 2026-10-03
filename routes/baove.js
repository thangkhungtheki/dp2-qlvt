const express = require('express');
const router = express.Router();
const Guard = require('../model/Guard');
const Patrol = require('../model/Patrol');
var axios = require('axios');
var PointBaove = require('../model/PointBaove');

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
        const baoveMailer = require('../sendmail/baove.sendmail');
        baoveMailer.sendPatrolReport(req.body); // Gọi hàm gửi mail báo cáo
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

// --- HÀM HỖ TRỢ TẠO QR CÓ CHỮ (Anh copy nguyên hàm generateQrWithText của anh vào đây) ---
async function generateQrWithText(doc) {
    // ... (Giữ nguyên code canvas của anh ở phần trước) ...
    // Trả về Base64
}

// ==========================================================
// 1. API CHO APP MOBILE (Khi quét QR sẽ gọi API này)
// ==========================================================
router.get('/api/dp3/baove/chot/:id', async (req, res) => {
    try {
        const chot = await PointBaove.findById(req.params.id);
        if (!chot) return res.status(404).json({ message: 'Không tìm thấy chốt' });
        res.status(200).json(chot);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================================
// 2. API CHO WEB ADMIN (VIEW, THÊM, SỬA, XÓA)
// ==========================================================

// Giao diện View danh sách chốt
router.get('/baove/chottuantra', async (req, res) => {
    try {
        let docs = await PointBaove.find().sort({ createdAt: -1 });
        res.render('admin_baove/view_chottuantra', { data: docs });
    } catch (error) {
        res.status(500).send("Lỗi server");
    }
});

// Thêm chốt mới
router.post('/baove/chottuantra/them', async (req, res) => {
    try {
        // Chuyển string công việc (xuống dòng) thành mảng array
        let congviecArray = req.body.congviec.split('\n').map(item => item.trim()).filter(item => item);

        let newPoint = new PointBaove({
            khuvuc: req.body.khuvuc,
            vitri: req.body.vitri,
            tencv: req.body.tencv,
            congviec: congviecArray
        });

        let savedDoc = await newPoint.save();

        // Tự động sinh QR sau khi có ID
        const currentId = savedDoc._id.toString();
        let qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + currentId;
        const response = await axios.get(qrCodeUrl, { responseType: 'arraybuffer' });
        let base64Image = Buffer.from(response.data).toString('base64');

        // Tạo QR có chữ
        const tempDoc = { tencv: savedDoc.tencv, vitri: savedDoc.vitri, maqr: base64Image };
        let maqrcochu = await generateQrWithText(tempDoc); // Anh nhớ import hàm Canvas

        // Cập nhật lại vào DB
        await PointBaove.findByIdAndUpdate(currentId, { maqr: base64Image, maqrcochu: maqrcochu });

        res.redirect('/baove/chottuantra');
    } catch (error) {
        console.error("Lỗi thêm chốt:", error);
        res.status(500).send("Lỗi hệ thống");
    }
});

// Xóa chốt
router.post('/baove/chottuantra/xoa', async (req, res) => {
    try {
        await PointBaove.findByIdAndDelete(req.body._id);
        res.redirect('/baove/chottuantra');
    } catch (error) {
        res.status(500).send("Lỗi xóa chốt");
    }
});

module.exports = router;