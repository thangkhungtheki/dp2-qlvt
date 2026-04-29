const nodemailer = require('nodemailer');
var moment = require('moment');

// 🔥 1. Logic Group dữ liệu cho Email nhắc việc
function groupData(list) {
    return {
        tuan: list.filter(x => x.loai_dinh_ky === 'tuan'),
        thang: list.filter(x => x.loai_dinh_ky === 'thang'),
        quy: list.filter(x => x.loai_dinh_ky === 'quy' || x.loai_dinh_ky === 'custom')
    }
}

// 🔥 2. Render từng Block nội dung
function renderBlock(title, arr, color) {
    if (!arr.length) return '';

    let itemsHtml = arr.map(x => `
        <div style="padding: 12px; margin-bottom: 10px; border-left: 5px solid ${color}; background-color: #fcfcfc; border: 1px solid #eeeeee; border-radius: 4px;">
            <div style="font-weight: bold; color: #2c3e50; font-size: 15px;">${x.tencv}</div>
            <div style="font-size: 13px; color: #7f8c8d; margin-top: 5px;">
                <span style="margin-right: 15px;">📍 <b>Vị trí:</b> ${x.vitri || 'Chưa xác định'}</span>
                <span>👤 <b>Phụ trách:</b> ${x.nguoi_phu_trach || 'Bàn giao ca'}</span>
            </div>
            <div style="font-size: 12px; margin-top: 8px;">
                <span style="background: ${x.muc_do === 'cao' ? '#e74c3c' : '#f39c12'}; color: white; padding: 2px 8px; border-radius: 10px; text-transform: uppercase; font-weight: bold;">
                    ${x.muc_do || 'trung bình'}
                </span>
                <span style="color: #34495e; margin-left: 15px; font-style: italic;">
                    ⏱ Thời hạn thực hiện: ${x.so_ngay_thuc_hien || 1} ngày
                </span>
            </div>
        </div>
    `).join('');

    return `
        <div style="margin-top: 25px;">
            <h3 style="color:${color}; border-bottom: 2px solid ${color}; padding-bottom: 8px; font-size: 17px;">
                ${title} (${arr.length})
            </h3>
            ${itemsHtml}
        </div>
    `;
}

// ======================= 🟢 SEND MAIL NHẮC VIỆC =======================

function sendmail(data) {
    var transporter = nodemailer.createTransport({
        host: process.env.HouseHostMail,
        port: process.env.HousePort,
        secure: true,
        auth: {
            user: process.env.HouseFrom,
            pass: process.env.HousePass,
        },
        tls: { rejectUnauthorized: false },
    });

    const daynow = moment().format('DD-MM-YYYY');
    let grouped = groupData(data);
    let mainHtml = '';

    mainHtml += renderBlock('📅 CÔNG VIỆC THEO TUẦN', grouped.tuan, '#2980b9');
    mainHtml += renderBlock('📆 CÔNG VIỆC THEO THÁNG', grouped.thang, '#27ae60');
    mainHtml += renderBlock('📊 CÔNG VIỆC THEO QUÝ / KHÁC', grouped.quy, '#8e44ad');

    if (mainHtml !== '') {
        const fullTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; border: 1px solid #dcdcdc; border-radius: 10px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #2c3e50, #4ca1af); color: white; padding: 25px; text-align: center;">
                <h2 style="margin: 0; letter-spacing: 1px;">THÔNG BÁO LỊCH LÀM VIỆC</h2>
                <p style="margin: 5px 0 0; opacity: 0.9;">Hệ thống nhắc việc tự động - Ngày ${daynow}</p>
            </div>
            <div style="padding: 25px; background-color: white;">
                <p style="color: #34495e; font-size: 15px;">Xin chào Ban Quản Lý,</p>
                <p style="color: #34495e; font-size: 15px;">Dưới đây là danh sách các công việc định kỳ cần thực hiện trong ngày hôm nay:</p>
                
                ${mainHtml}

                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eeeeee; font-size: 12px; color: #95a5a6; text-align: center;">
                    <p>Vui lòng kiểm tra và cập nhật trạng thái sau khi hoàn thành.</p>
                    <p style="font-weight: bold; color: #2c3e50;">DiamondPlace phòng House @2026</p>
                </div>
            </div>
        </div>
        `;

        var mailOptions = {
            from: `"DiamondPlace Housekeeping" <${process.env.HouseFrom}>`,
            to: process.env.HouseEmailTo,
            subject: `[LỊCH LÀM VIỆC] - NGÀY ${daynow}`,
            html: fullTemplate
        }

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) console.log('❌ Lỗi gửi mail nhắc việc:', err);
            else console.log('✅ Đã gửi mail nhắc việc ngày:', daynow);
        });
    } else {
        console.log('--- Ngày ' + daynow + ': Không có việc cần nhắc ---');
    }
}

// ======================= 🔵 SEND MAIL HOÀN THÀNH (GIỮ NGUYÊN) =======================

function sendMailComplete(taskData) {
    var transporter = nodemailer.createTransport({
        host: process.env.HouseHostMail,
        port: process.env.HousePort,
        secure: true,
        auth: {
            user: process.env.HouseFrom,
            pass: process.env.HousePass,
        },
        tls: { rejectUnauthorized: false },
    });

    try {
        const timeNow = moment().format('HH:mm DD-MM-YYYY');
        
        let htmlContent = `
            <h3 style="color: #2c3e50;">✅ Báo cáo hoàn thành công việc</h3>
            <p><b>Thời gian:</b> ${timeNow}</p>
            <p><b>Người thực hiện:</b> ${taskData.nguoithuchien}</p>
            <hr>
            <p><b>📌 Tên công việc:</b> <span style="color: blue; font-size: 16px;">${taskData.tencv}</span></p>
            <p><b>🏢 Khu vực:</b> <span style="color: #d35400;">${taskData.khuvuc}</span></p>
            <p><b>📍 Vị trí:</b> <b>${taskData.vitri}</b> ${taskData.phong ? `<i>(Chi tiết: ${taskData.phong})</i>` : ''}</p>
            <p><b>📝 Ghi chú:</b> ${taskData.noidung || 'Không có'}</p>
            <hr>
            <div style="font-size: 12px; text-align: center; color: #95a5a6;">
                <p>DiamondPlace phòng House @2026</p>
            </div>
        `;

        let attachments = [];
        if (taskData.imgthuchien && Array.isArray(taskData.imgthuchien)) {
            htmlContent += `<p><b>📷 Hình ảnh:</b></p><div style="display:flex;flex-wrap:wrap;">`;
            taskData.imgthuchien.forEach((img, index) => {
                let cid = `img_${index}_${Date.now()}@house`;
                htmlContent += `<img src="cid:${cid}" style="max-width:250px;margin:5px;">`;
                attachments.push({
                    filename: `img_${index}.jpg`,
                    path: img.startsWith('data:image') ? img : 'data:image/jpeg;base64,' + img,
                    cid: cid
                });
            });
            htmlContent += `</div>`;
        }

        var mailOptions = {
            from: process.env.HouseFrom,
            to: process.env.HouseEmailTo,
            subject: `[Đã xong] ${taskData.nguoithuchien} - ${taskData.tencv}`,
            html: htmlContent,
            attachments: attachments
        }

        transporter.sendMail(mailOptions, function(err, info) {
            if (err) console.log('❌ Lỗi mail hoàn thành:', err);
            else console.log('✅ Đã gửi mail hoàn thành:', taskData.tencv);
        });

    } catch (e) {
        console.log("❌ Lỗi sendMailComplete:", e);
    }
}

module.exports = {
    sendmail,
    sendMailComplete
}