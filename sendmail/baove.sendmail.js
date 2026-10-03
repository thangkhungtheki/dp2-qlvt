// sendmail/baove.sendmail.js
const nodemailer = require('nodemailer');
const moment = require('moment');

function sendPatrolReport(patrolData) {
    // 1. Cấu hình transporter (tương tự house)
    var transporter = nodemailer.createTransport({ /* ... */ });

    // 2. Render danh sách điểm đã quét (có thể chèn thêm ảnh Base64 bằng cid)
    let pointsHtml = patrolData.checkpoints.map(p => `
        <div style="border-bottom:1px solid #eee; padding:5px 0;">
            <b>${p.checkpointName}</b> (${p.time})<br>
            <i>Ghi chú: ${p.comment || 'An toàn'}</i>
        </div>
    `).join('');

    // 3. Render HTML tổng
    let htmlContent = `
        <h3 style="color:#2c3e50;">🛡️ DP3 - Báo Cáo Tuần Tra An Ninh</h3>
        <p><b>Nhân viên:</b> ${patrolData.guardName} (${patrolData.guardCode})</p>
        <p><b>Thời gian:</b> ${patrolData.startTime} - ${patrolData.endTime}</p>
        <p><b>Tổng số chốt đã kiểm tra:</b> ${patrolData.totalPoints}</p>
        <hr>
        ${pointsHtml}
    `;

    // 4. Xử lý Attachments: Ảnh Selfie nhận ca + Ảnh các chốt (nếu có)
    let attachments = [];
    if (patrolData.selfie) {
        attachments.push({ filename: 'selfie.jpg', path: patrolData.selfie, cid: 'selfie_img' });
        htmlContent = `<img src="cid:selfie_img" width="100" style="border-radius:50%;"><br>` + htmlContent;
    }
    // (Vòng lặp tương tự để map ảnh trong patrolData.checkpoints vào attachments)

    // 5. Gửi mail
    transporter.sendMail({ /* subject, html, attachments */ }, (err, info) => {
        if(err) console.log("Lỗi mail Bảo vệ:", err);
    });
}

module.exports = { sendPatrolReport };