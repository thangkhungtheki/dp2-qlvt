const express = require("express");
const router = express.Router();
const Model = require('../model/congviecdinhky');
const moment = require('moment');
const MailService = require('../sendmail/house.sendmail');

// Helper: Tự động nhận diện loại định kỳ từ text cũ (Migration)
function detectLoai(vitri = '') {
    const v = vitri.toLowerCase();
    if (v.includes('thứ')) return 'tuan';
    if (v.includes('2 tháng') || v.includes('3 tháng')) return 'quy';
    if (v.includes('tháng')) return 'thang';
    return 'custom';
}
/* GET: TRANG HIỂN THỊ FORM THÊM MỚI */
router.get('/cv/them', async (req, res) => {
    try {
        res.render('admin_house/main/them_cvdinhky', { 
            _username: 'Admin' // Hoặc lấy từ session nếu có
        });
    } catch (err) {
        res.status(500).send("Lỗi trang thêm");
    }
});
/* POST: THÊM CÔNG VIỆC MỚI */
router.post('/cv/create', async (req, res) => {
    try {
        let b = req.body;
        
        // Hàm chuyển chuỗi "2,4,6" -> [2,4,6]
        const strToArray = (s) => s ? s.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n)) : [];

        const newDoc = new Model({
            tencv: b.tencv,
            vitri: b.vitri,
            mo_ta: b.mo_ta,
            loai_dinh_ky: b.loai_dinh_ky,
            thu_trong_tuan: strToArray(b.thu_trong_tuan),
            ngay_trong_thang: strToArray(b.ngay_trong_thang),
            so_ngay_thuc_hien: parseInt(b.so_ngay_thuc_hien) || 1,
            so_ngay_nhac_truoc: parseInt(b.so_ngay_nhac_truoc) || 0,
            nguoi_phu_trach: b.nguoi_phu_trach,
            muc_do: b.muc_do,
            laplai: b.laplai === 'true',
            hoanthanh: false
        });

        await newDoc.save();
        res.redirect('/house/cv'); // Quay về trang danh sách
    } catch (err) {
        console.error("Lỗi thêm mới:", err);
        res.status(500).send("Không thể thêm công việc.");
    }
});
/* 🟢 DANH SÁCH CÔNG VIỆC */
router.get('/cv', async (req, res) => {
    try {
        const docs = await Model.find().sort({ created_at: -1 }).lean();
        const newData = docs.map(x => ({
            ...x,
            loai_dinh_ky: x.loai_dinh_ky || detectLoai(x.vitri)
        }));
        res.render('admin_house/main/view_cvdinhky', { data: newData, _username: 'Admin' });
    } catch (err) {
        res.status(500).send("Lỗi: " + err.message);
    }
});

/* 🔵 TRANG SỬA (GET) */
router.get('/cv/edit/:id', async (req, res) => {
    try {
        const data = await Model.findById(req.params.id).lean();
        res.render('admin_house/main/sua_cvdinhky', { data, _username: 'Admin' });
    } catch (err) {
        res.redirect('/house/cv');
    }
});

/* 🟡 CẬP NHẬT (POST) */
router.post('/cv/update/:id', async (req, res) => {
    try {
        const body = req.body;

        // 🧠 Hàm bóc tách chuỗi thành mảng số (VD: "1,2,3" -> [1,2,3])
        const toArray = (val) => {
            if (!val) return [];
            // Nếu là chuỗi thì split, nếu đã là mảng (do form gửi) thì map luôn
            const arr = Array.isArray(val) ? val : val.split(',');
            return arr.map(n => parseInt(n.trim())).filter(n => !isNaN(n));
        };

        // 🛠 Tổ chức lại dữ liệu để khớp hoàn toàn với Schema
        const updateData = {
            tencv: body.tencv,
            vitri: body.vitri,
            mo_ta: body.mo_ta, // Lưu vào field mo_ta mới
            phong_ban: body.phong_ban,
            nguoi_phu_trach: body.nguoi_phu_trach,
            muc_do: body.muc_do,
            
            // Cấu hình lịch trình
            loai_dinh_ky: body.loai_dinh_ky,
            thu_trong_tuan: toArray(body.thu_trong_tuan),
            ngay_trong_thang: toArray(body.ngay_trong_thang),
            thang_trong_quy: toArray(body.thang_trong_quy), // Đã bổ sung trường này
            
            // Thời gian
            lap_lai_moi: parseInt(body.lap_lai_moi) || 1,
            so_ngay_thuc_hien: parseInt(body.so_ngay_thuc_hien) || 1,
            so_ngay_nhac_truoc: parseInt(body.so_ngay_nhac_truoc) || 0,

            // Trạng thái (Checkbox xử lý kỹ để tránh lỗi undefined)
            laplai: body.laplai === 'true',
            hoanthanh: body.hoanthanh === 'true',
            
            // Reset flag gửi mail nếu có thay đổi (tùy chọn)
            flagguimail: false 
        };

        // Thực hiện cập nhật
        await Model.findByIdAndUpdate(req.params.id, updateData);

        console.log(`✅ Đã cập nhật CV: ${body.tencv}`);
        res.redirect('/house/cv');

    } catch (err) {
        console.error("❌ Lỗi Update:", err);
        res.status(500).send("Lỗi cập nhật dữ liệu. Vui lòng kiểm tra lại các trường số.");
    }
});

/* 🔴 XOÁ */
router.post('/cv/delete/:id', async (req, res) => {
    await Model.findByIdAndDelete(req.params.id);
    res.redirect('/house/cv');
});
router.get('/cron/sendmail', async (req, res) => {
    try {
        const today = new Date();
        const currentDayOfWeek = today.getDay() === 0 ? 8 : today.getDay() + 1; // Map CN=8, T2=2...T7=7
        const currentDayOfMonth = today.getDate();
        
        // 1. Lấy tất cả công việc đang kích hoạt lặp lại
        const allTasks = await Model.find({ laplai: true, hoanthanh: false }).lean();

        // 2. Lọc ra các việc "Phải làm hôm nay" hoặc "Sắp đến hạn cần nhắc"
        const tasksToNotify = allTasks.filter(task => {
            if (task.loai_dinh_ky === 'tuan') {
                return task.thu_trong_tuan.includes(currentDayOfWeek);
            }
            if (task.loai_dinh_ky === 'thang' || task.loai_dinh_ky === 'quy') {
                return task.ngay_trong_thang.includes(currentDayOfMonth);
            }
            return false;
        });

        // 3. Gửi Mail nếu có việc
        if (tasksToNotify.length > 0) {
            // Thêm field songayhethan giả lập để tương thích với file mail của anh
            const dataWithMeta = tasksToNotify.map(t => ({
                ...t,
                songayhethan: t.so_ngay_thuc_hien || 0 
            }));

            MailService.sendmail(dataWithMeta);
            return res.json({ status: 'success', sent: tasksToNotify.length });
        }

        res.json({ status: 'no_task_today' });

    } catch (err) {
        console.error("Cron Error:", err);
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;