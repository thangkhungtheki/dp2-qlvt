const express = require('express');
const router = express.Router();
const Guard = require('../model/Guard');
const Patrol = require('../model/Patrol');
const PointBaove = require('../model/PointBaove');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas'); // Thư viện vẽ chữ lên ảnh
const baoveMailer = require('../sendmail/baove.sendmail');
const moment = require('moment');

// Domain chính để ghép link ảnh tuyệt đối cho App và Email
const DOMAIN_URL = 'https://app.diamondplace.org';

// ==========================================================
// HÀM HỖ TRỢ 1: LƯU ẢNH BASE64 RA Ổ CỨNG & TRẢ VỀ LINK URL NHẸ
// ==========================================================
function saveBase64ToDisk(base64Str, prefix = 'chot') {
    try {
        // Nếu đã là link http hoặc rỗng thì giữ nguyên
        if (!base64Str || typeof base64Str !== 'string' || !base64Str.startsWith('data:image')) {
            return base64Str;
        }

        const matches = base64Str.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            return base64Str;
        }

        const ext = matches[1].includes('png') ? 'png' : 'jpg';
        const imageBuffer = Buffer.from(matches[2], 'base64');

        // Chia thư mục theo Năm-Tháng (VD: uploads_baove/2026-11)
        const folderMonth = moment().format('YYYY-MM');
        const uploadDir = path.join(__dirname, '..', 'uploads_baove', folderMonth);

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const cleanPrefix = String(prefix).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20) || 'img';
        const randomStr = Math.random().toString(36).substring(2, 7);
        const fileName = `${cleanPrefix}_${Date.now()}_${randomStr}.${ext}`;
        const fullPath = path.join(uploadDir, fileName);

        fs.writeFileSync(fullPath, imageBuffer);

        // Trả về URL đi qua chính router này (không cần cấu hình thêm express.static ở app.js)
        return `${DOMAIN_URL}/api/dp3/baove/uploads/${folderMonth}/${fileName}`;
    } catch (err) {
        console.error('Lỗi lưu ảnh ra ổ cứng:', err.message);
        return base64Str; // Nếu lỗi ghi file thì giữ nguyên base64 để không mất ảnh
    }
}

// Route phục vụ xem ảnh trực tiếp cho Email & Web Admin
router.get('/uploads/:folder/:filename', (req, res) => {
    const { folder, filename } = req.params;
    // Chống lỗi truy cập lùi thư mục (Path Traversal)
    const safeFolder = path.basename(folder);
    const safeFile = path.basename(filename);
    const filePath = path.join(__dirname, '..', 'uploads_baove', safeFolder, safeFile);

    if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
    }
    return res.status(404).send('Không tìm thấy ảnh');
});

// ==========================================================
// HÀM HỖ TRỢ 2: VẼ CHỮ LÊN ẢNH QR CODE (Tái sử dụng từ House)
// ==========================================================
async function generateQrWithText(doc) {
    try {
        if (!doc || !doc.maqr) return null;

        // Lưu ý: Đảm bảo đường dẫn tới ảnh nền default-background-1.png là chính xác
        const defaultImagePath = path.join(__dirname, './img', 'default-background-1.png');
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
        let congviecArray = (req.body.congviec || '').split('\n').map(item => item.trim()).filter(item => item);

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
        res.redirect('/api/dp3/baove/chottuantra');
    } catch (error) {
        res.status(500).send("Lỗi xóa chốt");
    }
});

// 1.4 Sửa chốt
router.post('/chottuantra/sua', async (req, res) => {
    try {
        let congviecArray = (req.body.congviec || '').split('\n').map(item => item.trim()).filter(item => item);
        const currentId = req.body._id;

        const currentPoint = await PointBaove.findById(currentId);
        if (!currentPoint) {
            return res.status(404).send("Không tìm thấy chốt.");
        }

        const updateData = {
            khuvuc: req.body.khuvuc,
            vitri: req.body.vitri,
            tencv: req.body.tencv,
            congviec: congviecArray
        };

        if (currentPoint.tencv !== req.body.tencv || currentPoint.vitri !== req.body.vitri) {
            const tempDoc = {
                tencv: req.body.tencv,
                vitri: req.body.vitri,
                maqr: currentPoint.maqr
            };
            updateData.maqrcochu = await generateQrWithText(tempDoc);
        }

        await PointBaove.findByIdAndUpdate(currentId, updateData);
        res.redirect('/api/dp3/baove/chottuantra');
    } catch (error) {
        console.error("Lỗi sửa chốt:", error);
        res.status(500).send("Lỗi hệ thống khi sửa chốt.");
    }
});

// ==========================================================
// QUẢN LÝ NHÂN VIÊN BẢO VỆ (WEB ADMIN)
// ==========================================================

// Giao diện danh sách nhân viên
router.get('/nhanvien', async (req, res) => {
    try {
        let guards = await Guard.find().sort({ createdAt: -1 });
        res.render('admin_baove/view_nhanvien', { data: guards });
    } catch (error) {
        res.status(500).send("Lỗi tải danh sách nhân viên");
    }
});

// Thêm nhân viên mới
router.post('/nhanvien/them', async (req, res) => {
    try {
        const newGuard = new Guard({
            code: req.body.code,
            name: req.body.name,
            role: req.body.role || 'Bảo vệ',
            isActive: true
        });
        await newGuard.save();
        res.redirect('/api/dp3/baove/nhanvien');
    } catch (error) {
        console.error("Lỗi thêm nhân viên:", error);
        res.status(500).send("Lỗi thêm nhân viên (Có thể trùng mã nhân viên)");
    }
});

// Xóa nhân viên
router.post('/nhanvien/xoa', async (req, res) => {
    try {
        await Guard.findByIdAndDelete(req.body._id);
        res.redirect('/api/dp3/baove/nhanvien');
    } catch (error) {
        res.status(500).send("Lỗi xóa nhân viên");
    }
});

// 1.4 GET: Lịch sử tuần tra (ĐÃ TỐI ƯU PHÂN TRANG & KHÔNG LOAD SẴN CHECKPOINTS)
router.get('/lichsu', async (req, res) => {
    try {
        let { date, guardName, page } = req.query;
        let currentPage = Math.max(1, parseInt(page) || 1);
        let limit = 15; // Mỗi trang hiển thị 15 ca trực cho cực nhẹ
        let skip = (currentPage - 1) * limit;

        let matchStage = {};

        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            matchStage.createdAt = { $gte: startOfDay, $lte: endOfDay };
        }

        if (guardName) {
            matchStage.guardName = { $regex: guardName, $options: 'i' };
        }

        // Đếm tổng số bản ghi và lấy danh sách rút gọn (KHÔNG kéo mảng checkpoints nặng nề về)
        const [totalDocs, histories] = await Promise.all([
            Patrol.countDocuments(matchStage),
            Patrol.aggregate([
                { $match: matchStage },
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: limit },
                {
                    $project: {
                        guardId: 1,
                        guardCode: 1,
                        guardName: 1,
                        selfie: 1,
                        startTime: 1,
                        endTime: 1,
                        createdAt: 1,
                        totalPoints: {
                            $ifNull: ['$totalPoints', { $size: { $ifNull: ['$checkpoints', []] } }]
                        },
                        // Đếm số chốt có ghi chú bất thường ngay trong DB mà không cần tải cả mảng về
                        abnormalCount: {
                            $size: {
                                $filter: {
                                    input: { $ifNull: ['$checkpoints', []] },
                                    as: 'cp',
                                    cond: {
                                        $and: [
                                            { $ne: ['$$cp.comment', null] },
                                            { $ne: ['$$cp.comment', ''] }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            ])
        ]);

        const totalPages = Math.ceil(totalDocs / limit) || 1;

        res.render('admin_baove/view_lichsu', {
            data: histories,
            searchDate: date || '',
            searchName: guardName || '',
            currentPage: currentPage,
            totalPages: totalPages,
            totalDocs: totalDocs,
            moment: moment
        });
    } catch (error) {
        console.error("Lỗi xem lịch sử:", error);
        res.status(500).send("Lỗi tải lịch sử hệ thống");
    }
});

// 1.5 GET API: Lấy chi tiết hành trình của 1 ca trực khi bấm nút (AJAX Lazy Load)
router.get('/lichsu/chitiet/:id', async (req, res) => {
    try {
        const patrol = await Patrol.findById(req.params.id).select('checkpoints').lean();
        if (!patrol) {
            return res.status(404).json({ ok: false, message: 'Không tìm thấy ca trực' });
        }
        return res.json({ ok: true, checkpoints: patrol.checkpoints || [] });
    } catch (error) {
        return res.status(500).json({ ok: false, message: error.message });
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

// 2.2 POST Upload từng ảnh ngay khi bảo vệ bấm "LƯU CHỐT" (Giúp cuối ca nộp cực nhanh)
router.post('/upload-image', async (req, res) => {
    try {
        const { base64, prefix } = req.body;
        if (!base64) {
            return res.status(400).json({ ok: false, message: 'Thiếu dữ liệu ảnh' });
        }
        const imageUrl = saveBase64ToDisk(base64, prefix || 'chot');
        return res.status(200).json({ ok: true, url: imageUrl });
    } catch (error) {
        console.error("Lỗi upload ảnh chốt:", error);
        return res.status(500).json({ ok: false, message: error.message });
    }
});

// 2.3 POST Nộp báo cáo tuần tra (Tối ưu cho 30-40 chốt, 5 ảnh/chốt)
router.post('/patrols', async (req, res) => {
    try {
        let { guardId, guardCode, guardName, selfie, startTime, endTime, totalPoints, checkpoints, createdAt } = req.body;

        // 1. Nếu ảnh selfie hoặc ảnh chốt nào còn ở dạng Base64 (do lúc lưu chốt dưới hầm mất sóng),
        // tự động chuyển nốt thành file ảnh và lấy link URL nhẹ trước khi lưu DB & gửi mail
        if (selfie && selfie.startsWith('data:image')) {
            selfie = saveBase64ToDisk(selfie, 'selfie');
        }

        if (Array.isArray(checkpoints)) {
            checkpoints = checkpoints.map(cp => {
                if (Array.isArray(cp.anhthuchien)) {
                    cp.anhthuchien = cp.anhthuchien.map(img =>
                        (img && img.startsWith('data:image')) ? saveBase64ToDisk(img, cp.qrCode || 'chot') : img
                    );
                }
                return cp;
            });
        }

        const patrolPayload = {
            guardId,
            guardCode,
            guardName,
            selfie,
            startTime,
            endTime,
            totalPoints: totalPoints || (checkpoints ? checkpoints.length : 0),
            checkpoints: checkpoints || [],
            createdAt: createdAt || new Date()
        };

        const newPatrol = new Patrol(patrolPayload);
        const savedPatrol = await newPatrol.save();

        // 2. PHẢN HỒI NGAY CHO APP TRONG 0.1 GIÂY (Bảo vệ không phải đứng chờ gửi mail)
        res.status(201).json({
            success: true,
            message: "Đã lưu ca tuần tra thành công!",
            data: savedPatrol._id
        });

        // 3. CHẠY NGẦM VIỆC GỬI MAIL Ở PHÍA SAU
        setImmediate(async () => {
            try {
                await baoveMailer.sendPatrolReport(patrolPayload);
            } catch (mailErr) {
                console.error("Lỗi gửi mail báo cáo tuần tra chạy ngầm:", mailErr);
            }
        });

    } catch (error) {
        console.error("Lỗi lưu ca tuần tra:", error);
        res.status(500).json({ message: "Lỗi server khi lưu báo cáo", error: error.message });
    }
});

// 2.4 POST Tạo data bảo vệ mẫu
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

// 2.5 GET Kéo thông tin chốt khi quét QR
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