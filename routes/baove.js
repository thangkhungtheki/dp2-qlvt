const express = require('express');
const router = express.Router();
const Guard = require('../model/Guard');
const Patrol = require('../model/Patrol');
const PointBaove = require('../model/PointBaove');
const axios = require('axios');
const path = require('path');
const { createCanvas, loadImage } = require('canvas'); // Thư viện vẽ chữ lên ảnh
const baoveMailer = require('../sendmail/baove.sendmail');
const moment = require('moment');

// ==========================================================
// HÀM HỖ TRỢ: VẼ CHỮ LÊN ẢNH QR CODE (Tái sử dụng từ House)
// ==========================================================
async function generateQrWithText(doc) {
    try {
        if (!doc || !doc.maqr) return null;

        // Lưu ý: Đảm bảo đường dẫn tới ảnh nền default-background-1.png là chính xác
        const defaultImagePath = path.join(__dirname, '../img', 'default-background-1.png');
        let backgroundImage;
        try {
            backgroundImage = await loadImage(defaultImagePath);
        } catch (err) {
            console.error('Không tìm thấy ảnh nền Canvas:', err.message);
            return null;
        }

        const deviceName = doc.tencv || 'Chốt Tuần Tra';
        const location = doc.vitri || 'Vị trí';
        
        const qrBase64Clean = doc.maqr.replace(/^data:image\/\w+;base64,/, '');
        const qrCodeImageBuffer = Buffer.from(qrBase64Clean, 'base64');
        const qrImage = await loadImage(qrCodeImageBuffer);

        const canvas = createCanvas(backgroundImage.width, backgroundImage.height);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(backgroundImage, 0, 0);

        const qrSize = 200;
        const qrLeft = (backgroundImage.width - qrSize) / 2;
        const qrTop = (backgroundImage.height - qrSize) / 2;
        ctx.drawImage(qrImage, qrLeft, qrTop, qrSize, qrSize);

        const fontSizeTop = Math.round(backgroundImage.width * 0.05);
        ctx.font = `bold ${fontSizeTop}px Arial`;
        ctx.fillStyle = 'lime';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        const deviceNameY = Math.round(backgroundImage.height * 0.15);
        ctx.textAlign = 'center';
        ctx.strokeText(deviceName, backgroundImage.width / 2, deviceNameY);
        ctx.fillText(deviceName, backgroundImage.width / 2, deviceNameY);

        const fontSizeBottom = Math.round(backgroundImage.width * 0.05);
        ctx.font = `bold ${fontSizeBottom}px Arial`;
        ctx.fillStyle = 'yellow';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        const locationY = Math.round(backgroundImage.height * 0.90);
        ctx.strokeText(location, backgroundImage.width / 2, locationY);
        ctx.fillText(location, backgroundImage.width / 2, locationY);

        return canvas.toBuffer('image/png').toString('base64');
    } catch (error) {
        console.error('Lỗi xử lý canvas: ', error);
        return null;
    }
}

// ==========================================================
// PHẦN 1: ROUTE TĨNH CHO WEB ADMIN (PHẢI ĐẶT LÊN TRÊN CÙNG)
// ==========================================================

// 1.1 Giao diện View danh sách chốt
router.get('/chottuantra', async (req, res) => {
    try {
        let docs = await PointBaove.find().sort({ createdAt: -1 });
        res.render('admin_baove/view_chottuantra', { data: docs });
    } catch (error) {
        res.status(500).send("Lỗi server");
    }
});

// 1.2 Thêm chốt mới
router.post('/chottuantra/them', async (req, res) => {
    try {
        let congviecArray = req.body.congviec.split('\n').map(item => item.trim()).filter(item => item);

        let newPoint = new PointBaove({
            khuvuc: req.body.khuvuc,
            vitri: req.body.vitri,
            tencv: req.body.tencv,
            congviec: congviecArray
        });

        let savedDoc = await newPoint.save();
        const currentId = savedDoc._id.toString();
        let qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + currentId;
        const response = await axios.get(qrCodeUrl, { responseType: 'arraybuffer' });
        let base64Image = Buffer.from(response.data).toString('base64');

        const tempDoc = { tencv: savedDoc.tencv, vitri: savedDoc.vitri, maqr: base64Image };
        let maqrcochu = await generateQrWithText(tempDoc);

        await PointBaove.findByIdAndUpdate(currentId, { maqr: base64Image, maqrcochu: maqrcochu });

        // [FIXED] Redirect đúng full path
        res.redirect('/api/dp3/baove/chottuantra');
    } catch (error) {
        console.error("Lỗi thêm chốt:", error);
        res.status(500).send("Lỗi hệ thống");
    }
});

// 1.3 Xóa chốt
router.post('/chottuantra/xoa', async (req, res) => {
    try {
        await PointBaove.findByIdAndDelete(req.body._id);
        // [FIXED] Redirect đúng full path
        res.redirect('/api/dp3/baove/chottuantra');
    } catch (error) {
        res.status(500).send("Lỗi xóa chốt");
    }
});

// 1.4 GET: Lịch sử tuần tra
router.get('/lichsu', async (req, res) => {
    try {
        let { date, guardName } = req.query;
        let queryCondition = {};

        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            queryCondition.createdAt = { $gte: startOfDay,$lte: endOfDay };
        }

        if (guardName) {
            queryCondition.guardName = { $regex: guardName,$options: 'i' };
        }

        const histories = await Patrol.find(queryCondition).sort({ createdAt: -1 });

        res.render('admin_baove/view_lichsu', { 
            data: histories, 
            searchDate: date || '', 
            searchName: guardName || '',
            moment: moment 
        });
    } catch (error) {
        console.error("Lỗi xem lịch sử:", error);
        res.status(500).send("Lỗi tải lịch sử hệ thống");
    }
});


// ==========================================================
// PHẦN 2: ROUTE ĐỘNG CHO APP MOBILE (PHẢI ĐẶT DƯỚI CÙNG)
// ==========================================================

// 2.1 GET Lấy danh sách bảo vệ
router.get('/guards', async (req, res) => {
    try {
        const guards = await Guard.find({ isActive: true }).select('-__v');
        res.status(200).json(guards);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
});

// 2.2 POST Nộp báo cáo tuần tra
router.post('/patrols', async (req, res) => {
    try {
        const { guardId, guardCode, guardName, selfie, startTime, endTime, totalPoints, checkpoints, createdAt } = req.body;

        const newPatrol = new Patrol({
            guardId, guardCode, guardName, selfie, startTime, endTime, totalPoints, checkpoints,
            createdAt: createdAt || new Date()
        });

        const savedPatrol = await newPatrol.save();
        
        // Gọi hàm gửi mail báo cáo
        baoveMailer.sendPatrolReport(req.body); 
        
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

// 2.3 POST Tạo data bảo vệ mẫu
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

// 2.4 GET Kéo thông tin chốt khi quét QR (ĐÃ ĐỔI THÀNH /chot/:id CHO AN TOÀN)
router.get('/chot/:id', async (req, res) => {
    try {
        const chot = await PointBaove.findById(req.params.id);
        if (!chot) return res.status(404).json({ message: 'Không tìm thấy chốt' });
        res.status(200).json(chot);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;