var express = require("express");
var router = express.Router();
var xuly = require('../CRUD/housetask');
var taskkiemtradinhky = require("../CRUD/taskkiemtradinhky");
var moment = require('moment');
const exceljs = require('exceljs');
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const sharp = require('sharp');
const { createCanvas, loadImage } = require('canvas');
const mailer = require("../sendmail/house.sendmail");

// --- CÁC HÀM HỖ TRỢ XỬ LÝ (HELPER FUNCTIONS) ---

// Hàm xử lý tạo ảnh QR có chữ (Tách ra để tái sử dụng)
async function generateQrWithText(doc) {
    try {
        if (!doc || !doc.maqr) {
            // console.log(`[Warning] Không có data maqr gốc cho: ${doc.tencv}`);
            return null;
        }

        const defaultImagePath = path.join(__dirname, 'img', 'default-background-1.png');
        let backgroundImage;
        try {
            backgroundImage = await loadImage(defaultImagePath);
        } catch (err) {
            console.log('Failed to load background image', err);
            return null;
        }

        const deviceName = doc.tencv || 'Tên Công Việc';
        const location = doc.vitri || 'Vị trí công việc';
        const qrCodeImageBuffer = Buffer.from(doc.maqr, 'base64');
        const qrImage = await loadImage(qrCodeImageBuffer);

        const canvas = createCanvas(backgroundImage.width, backgroundImage.height);
        const ctx = canvas.getContext('2d');

        // Vẽ nền
        ctx.drawImage(backgroundImage, 0, 0);

        // Vẽ QR ở giữa
        const qrSize = 200;
        const qrLeft = (backgroundImage.width - qrSize) / 2;
        const qrTop = (backgroundImage.height - qrSize) / 2;
        ctx.drawImage(qrImage, qrLeft, qrTop, qrSize, qrSize);

        // Vẽ Text: TÊN CÔNG VIỆC (dòng trên)
        const fontSizeTop = Math.round(backgroundImage.width * 0.05);
        ctx.font = `bold ${fontSizeTop}px Arial`;
        ctx.fillStyle = 'lime';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        const deviceNameY = Math.round(backgroundImage.height * 0.1);
        ctx.textAlign = 'center';
        ctx.strokeText(deviceName, backgroundImage.width / 2, deviceNameY);
        ctx.fillText(deviceName, backgroundImage.width / 2, deviceNameY);

        // Vẽ Text: VỊ TRÍ (dòng dưới)
        const fontSizeBottom = Math.round(backgroundImage.width * 0.05);
        ctx.font = `bold ${fontSizeBottom}px Arial`;
        ctx.fillStyle = 'yellow';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        const locationY = Math.round(backgroundImage.height * 0.95);
        ctx.strokeText(location, backgroundImage.width / 2, locationY);
        ctx.fillText(location, backgroundImage.width / 2, locationY);

        return canvas.toBuffer('image/png').toString('base64');
    } catch (error) {
        console.log('Lỗi xử lý canvas: ', error);
        return null;
    }
}

// Hàm cập nhật QR gốc (gọi API ngoài) và QR có chữ
async function updateFullQRCode(docId) {
    try {
        // 1. Lấy dữ liệu mới nhất
        let docs = await xuly.docs({ _id: docId });
        let document = docs[0];
        if (!document) return;

        // 2. Tạo/Cập nhật mã QR gốc (Base64)
        let base64Image = document.maqr;
        if (!base64Image) {
             // Chỉ gọi API tạo QR nếu chưa có hoặc muốn reset (ở đây logic anh là chưa có mới tạo)
            let qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + document.id;
            const response = await axios.get(qrCodeUrl, { responseType: 'arraybuffer' });
            base64Image = Buffer.from(response.data).toString('base64');
        }

        // 3. Tạo mã QR có chữ (Canvas)
        // Tạo object tạm để truyền vào hàm generate
        const tempDoc = { ...document, maqr: base64Image };
        const maqrcochu = await generateQrWithText(tempDoc);

        // 4. Update vào DB
        const updateBody = {
            maqr: base64Image,
            maqrcochu: maqrcochu
        };
        await xuly.updates(document.id, updateBody);
        console.log(`Đã cập nhật QR cho ID: ${document.id}`);

    } catch (e) {
        console.error("Lỗi updateFullQRCode: ", e);
    }
}


// --- ROUTES ---

router.get('/api/xuatexcel', async function (req, res) {
    try {
        let documents = await xuly.docs();

        if (!Array.isArray(documents)) {
            documents = Object.values(documents);
        }

        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet('DongcoMayLanh');

        const columns = [
            { header: 'khuvuc', key: 'khuvuc', width: 15 },
            { header: 'vitri', key: 'vitri', width: 30 },
            { header: 'tencv', key: 'tencv', width: 20 },
            { header: 'ngaybatdau', key: 'ngaybatdau', width: 15 },
            { header: 'ngayketthuc', key: 'ngayketthuc', width: 15 },
            { header: 'motacongviec', key: 'motacongviec', width: 25 },
            { header: 'solanlam', key: 'solanlam', width: 15 },
            { header: 'lichsucv', key: 'lichsucv', width: 20 },
            { header: 'thoigian', key: 'thoigian', width: 15 },
            { header: 'lichsukiemtra', key: 'lichsukiemtra', width: 30 },
            { header: 'QR Code', key: 'maqrcochu', width: 20, style: { alignment: { vertical: 'middle', horizontal: 'center' } } },
        ];
        worksheet.columns = columns;

        const qrCodeColumnIndex = 10;
        const desiredImageWidth = 80;
        const desiredImageHeight = 80;

        // Dùng for...of để an toàn với async
        for (const [index, document] of documents.entries()) {
            const rowNumber = index + 2;

            worksheet.addRow({
                khuvuc: document.khuvuc,
                vitri: document.vitri,
                tencv: document.tencv,
                ngaybatdau: document.ngaybatdau,
                ngayketthuc: document.ngayketthuc,
                motacongviec: document.motacongviec,
                solanlam: document.solanlam,
                lichsucv: document.lichsucv,
                thoigian: document.thoigian,
                lichsukiemtra: document.lichsukiemtra,
                maqrcochu: '',
            });

            if (document.maqrcochu) {
                try {
                    // Loại bỏ prefix nếu có (ví dụ data:image/png;base64,)
                    const base64Data = document.maqrcochu.replace(/^data:image\/\w+;base64,/, '');
                    const imageBuffer = Buffer.from(base64Data, 'base64');

                    const imageId = workbook.addImage({
                        buffer: imageBuffer,
                        extension: 'png',
                    });

                    // Tính toán ô để đặt ảnh
                    const qrCodeCell = worksheet.getCell(rowNumber, qrCodeColumnIndex + 1);
                    const topLeft = { col: qrCodeCell.col - 1, row: qrCodeCell.row - 1 };

                    worksheet.addImage(imageId, {
                        tl: topLeft,
                        ext: { width: desiredImageWidth, height: desiredImageHeight },
                        editAs: 'oneCell',
                    });

                    worksheet.getRow(rowNumber).height = desiredImageHeight * 0.75;
                } catch (error) {
                    console.error(`Lỗi xử lý QR code cho ${document.tencv}:`, error);
                }
            } else {
                worksheet.getRow(rowNumber).height = 20;
            }
        }

        const lastRow = documents.length + 1;
        const lastColumn = columns.length;
        const borderStyles = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };

        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            row.eachCell((cell, colNumber) => {
                cell.border = borderStyles;
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=dp1.house.congviec.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Lỗi tổng xuất excel:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/api/them', async function (req, res) {
    let docs = await xuly.docs({});
    res.render('admin_house/main/view_them_housetask', { docs, moment });
});

router.get('/api/view', async function (req, res) {
    const khuvuc = req.query.khuvuc || '';
    let docs = await xuly.docs({ khuvuc: { $regex: khuvuc } });
    res.render('admin_house/main/view_housetask', { data: docs, moment });
});

router.get('/api/congviec/:id', async (req, res) => {
    let body = req.params.id;
    let docs = await xuly.docs({ _id: body });
    res.send({ cv: docs[0] });
});

router.get('/app/house/congviec', async (req, res) => {
    let body = req.query.id;
    let docs = await xuly.docs({ _id: body });
    res.json(docs[0]);
});

router.post('/api/congviec/update', async (req, res) => {
    try {
        let id = req.body._id;
        let body = {
            khuvuc: req.body.khuvuc,
            vitri: req.body.vitri,
            tencv: req.body.tencv,
            ngaybatdau: req.body.ngaybatdau,
            ngayketthuc: req.body.ngayketthuc,
            motacongviec: req.body.motacongviec,
            solanlam: req.body.solanlam,
            congviectheothang: req.body.congviectheothang,
            lichsucv: req.body.lichsucv,
            thoigian: req.body.thoigian,
            songaynhacthongbao: req.body.songaynhacthongbao,
            lichsukiemtra: req.body.lichsukiemtra
        };

        let result = await xuly.updates(id, body);
        
        // Tối ưu: Gọi hàm trực tiếp, không gọi qua axios (tránh loop request)
        if (result) {
            await updateFullQRCode(id); // Gọi hàm update QR background
            res.redirect('/housetask/api/view');
        } else {
            res.send('Cập nhật không thành công');
        }
    } catch (error) {
        console.error("Lỗi update congviec:", error);
        res.status(500).send("Lỗi server");
    }
});

router.post('/api/congviec/them', async (req, res) => {
    try {
        let body = {
            khuvuc: req.body.khuvuc,
            vitri: req.body.vitri,
            tencv: req.body.tencv,
            congviectheothang: req.body.congviectheothang,
            ngaybatdau: req.body.ngaybatdau,
            ngayketthuc: req.body.ngayketthuc,
            solanlam: req.body.solanlam,
            thoigian: req.body.thoigian,
            songaynhacthongbao: req.body.songaynhacthongbao,
            motacongviec: req.body.motacongviec,
            lichsucv: req.body.lichsucv,
            lichsukiemtra: req.body.lichsukiemtra
        };

        let result = await xuly.create(body);
        
        // Tối ưu: Gọi hàm trực tiếp
        if (result) {
            // result thường trả về object vừa tạo, lấy ID từ đó
            const newId = result._id || result.id; // Tùy thuộc vào hàm create trả về gì
            if(newId) await updateFullQRCode(newId);
            
            res.redirect('/housetask/api/view');
        } else {
            res.send('Thêm công việc không thành công');
        }
    } catch (error) {
        console.error("Lỗi thêm công việc:", error);
        res.status(500).send("Lỗi server");
    }
});

router.post('/api/congviec/delete', async (req, res) => {
    let id = req.body._id;
    let result = await xuly.deletes(id);
    if (result) {
        res.status(200).send('Xóa công việc thành công');
    } else {
        res.status(500).send('Xóa công việc không thành công');
    }
});

// API này dùng để chạy thủ công tất cả nếu cần reset
router.get('/api/capnhatmaqr', async (req, res) => {
    try {
        const documents = await xuly.docs({});
        // Sử dụng for...of để đợi xử lý tuần tự (async/await trong forEach không hoạt động như mong đợi)
        for (const document of documents) {
            try {
                let qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + document.id;
                let base64Image;

                if (!document.maqr) {
                    const response = await axios.get(qrCodeUrl, { responseType: 'arraybuffer' });
                    base64Image = Buffer.from(response.data).toString('base64');
                } else {
                    base64Image = document.maqr;
                }

                // Cập nhật lại chỉ maqr
                await xuly.updates(document.id, { maqr: base64Image });
                console.log("Updated QR Base for:", document.tencv);
            } catch (e) {
                console.log("Lỗi chi tiết ID: ", document.id, e.message);
            }
        }
        res.send('Đã cập nhật xong mã QR gốc');
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi cập nhật");
    }
});

// API chạy thủ công tạo ảnh canvas hàng loạt
router.get('/api/capnhatmaqrcochu', async (req, res) => {
    try {
        const documents = await xuly.docs({});
        
        for (const document of documents) {
            try {
                // Tạo ảnh canvas
                let resultmaqrcochu = await generateQrWithText(document);
                
                if (resultmaqrcochu) {
                     await xuly.updates(document.id, { maqrcochu: resultmaqrcochu });
                     console.log('Success co chu:', document.tencv);
                }
            } catch (e) {
                console.log("Lỗi canvas ID: ", document.id, e);
            }
        }
        res.send('Đã cập nhật xong QR có chữ');
    } catch (error) {
         console.error(error);
         res.status(500).send("Lỗi cập nhật");
    }
});

router.put('/api/upload-thuchien', async (req, res) => {
    try {
        const { idcongviec, phong, noidung, nguoithuchien, imgthuchien } = req.body;
        
        // Sử dụng moment để lấy giờ hiện tại chuẩn xác và dễ đọc
        const now = moment().utcOffset(7); 
        const ngayGioUTC7 = now.format('DD-MM-YYYY HH:mm:ss');
        
        const newRecord = {
            ngay: ngayGioUTC7,
            idcongviec: idcongviec,
            phong: phong,
            noidung: noidung,
            nguoithuchien: nguoithuchien,
            imgthuchien: imgthuchien, // Mảng base64 từ client
            nguoikiemtra: 'chưa kiểm tra',
        };

        let docss = await xuly.docs({ _id: idcongviec });
        
        let dongMoi = `${ngayGioUTC7} ${newRecord.noidung}`;
        let lichsucv;
        
        // Kiểm tra tồn tại để nối chuỗi
        if (docss[0] && docss[0].lichsucv) {
            lichsucv = docss[0].lichsucv + `\n${dongMoi}`;
        } else {
            lichsucv = dongMoi;
        }
        // Chuẩn bị dữ liệu để gửi mail (Lấy tên công việc từ docss đã query ở trên)
       const mailData = {
            // Lấy thông tin từ Công việc gốc (docss[0])
            tencv: docss[0] ? docss[0].tencv : 'Công việc không tên',
            khuvuc: docss[0] ? docss[0].khuvuc : 'Chưa xác định', // ✅ Thêm Khu vực
            vitri: docss[0] ? docss[0].vitri : 'Chưa xác định',   // ✅ Thêm Vị trí gốc
            
            // Thông tin người thực hiện gửi lên
            nguoithuchien: nguoithuchien,
            phong: phong, // (Có thể là vị trí chi tiết lúc làm, nếu có thì mình hiển thị kèm)
            noidung: noidung,
            imgthuchien: imgthuchien
        };
        // Thực hiện lưu song song để tối ưu thời gian
        await Promise.all([
            xuly.xulyupdate_lichsucv(idcongviec, lichsucv),
            taskkiemtradinhky.creates(newRecord),
            // --------------------------------------------------
            // chỗ này có thể thao tác send email hoặc thông báo nếu cần
            mailer.sendMailComplete(mailData) 
            // --------------------------------------------------
        ]);

        res.send("Tải ảnh và lưu dữ liệu thành công!");
    } catch (error) {
        console.log('❌ Lỗi upload ảnh:', error);
        res.status(500).send('Lỗi khi xử lý ảnh');
    }
});

router.get('/app/house/kiemtra', async (req, res) => {
    let idcongviec = req.query.idcongviec;
    let today = moment().format('DD-MM-YYYY');
    
    // RegExp để tìm đúng ngày bắt đầu
    let docs = await taskkiemtradinhky.docs({ idcongviec: idcongviec, ngay: { $regex: `^${today}` } });
    res.send(docs);
});

router.put('/api/kiemtra/update', async (req, res) => {
    try {
        // Lấy dữ liệu từ App gửi lên
        const { _id, nguoikiemtra, idcongviec } = req.body;

        if (!_id || !nguoikiemtra) {
            return res.status(400).send("Thiếu ID hoặc tên người kiểm tra");
        }
        
        // Lấy giờ hiện tại chuẩn UTC+7
        const timeCheck = moment().utcOffset(7).format('DD-MM-YYYY HH:mm:ss');

        // 1. CẬP NHẬT BẢN GHI THỰC HIỆN (HOUSE_CV_DINHKY)
        // Quan trọng: Phải update thêm 'check': 'x' thì App mới đổi màu xanh
        const updateBody = {
            nguoikiemtra: nguoikiemtra,
            check: 'x' 
        };
        
        // Sử dụng hàm updates (thay vì updateoneset) để update được nhiều trường cùng lúc
        await taskkiemtradinhky.updates(_id, updateBody);
        
        // 2. CẬP NHẬT LỊCH SỬ VÀO CÔNG VIỆC GỐC (HOUSETASK)
        if (idcongviec) {
            // Tìm công việc gốc
            let parentTask = await xuly.docs({ _id: idcongviec });
            
            if (parentTask && parentTask.length > 0) {
                let currentHistory = parentTask[0].lichsukiemtra || '';
                // Thêm dòng lịch sử mới vào
                let newHistoryLine = `${timeCheck} Đã kiểm tra bởi: ${nguoikiemtra}`;
                
                // Nối chuỗi (xử lý xuống dòng nếu đã có lịch sử cũ)
                let finalHistory = currentHistory ? (currentHistory + '\n' + newHistoryLine) : newHistoryLine;
                
                // Update vào DB
                await xuly.xulyupdate_lichsukiemtra(idcongviec, finalHistory);
            }
        }

        res.status(200).send('Cập nhật kiểm tra thành công');

    } catch (error) {
        console.error("Lỗi update kiểm tra:", error);
        res.status(500).send("Lỗi server: " + error.message);
    }
});
// Route xem lịch sử chi tiết của một công việc
router.get('/api/history/:id', async (req, res) => {
    try {
        let idcongviec = req.params.id;

        // 1. Lấy thông tin công việc gốc (để hiện tên công việc trên tiêu đề)
        let congviec = await xuly.docs({_id: idcongviec});
        
        // 2. Lấy danh sách lịch sử từ model 'house_cv_dinhky'
        let history = await taskkiemtradinhky.docs({idcongviec: idcongviec});

        // 3. Sắp xếp lịch sử: Mới nhất lên đầu (dựa vào createdAt do anh đã bật timestamps: true)
        history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // 4. Render view
        res.render('admin_house/main/view_history_housetask', { 
            task: congviec[0] || { tencv: 'Không xác định' }, // Phòng hờ nếu xóa công việc gốc
            data: history, 
            moment: moment 
        });

    } catch (error) {
        console.error("Lỗi xem lịch sử:", error);
        res.status(500).send("Lỗi tải lịch sử công việc");
    }
});
module.exports = router;