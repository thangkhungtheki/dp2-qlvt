const nodemailer = require('nodemailer');
const moment = require('moment');

async function sendPatrolReport(patrolData) {
    try {
        // Tận dụng chung cấu hình SMTP hiện có của anh (hoặc đổi thành config riêng nếu cần)
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

        const timeNow = moment().utcOffset(7).format('DD-MM-YYYY');
        let attachments = [];

        // 1. Render danh sách các điểm đã tuần tra
        let pointsHtml = patrolData.checkpoints.map((p, index) => {
            // Render checklist công việc của từng chốt
            let checklistHtml = '';
            if (p.congviec && p.congviec.length > 0) {
                checklistHtml = '<ul style="margin-top:5px; margin-bottom:5px; padding-left:20px; font-size:13px;">' + 
                    p.congviec.map(cv => `<li>${cv.isDone ? '✅' : '⬛'} ${cv.name}</li>`).join('') + 
                '</ul>';
            }

            // Xử lý ảnh minh họa của chốt (Gắn Base64 vào file đính kèm dạng cid)
            let imageHtml = '';
            if (p.anhthuchien && p.anhthuchien.length > 0) {
                imageHtml = '<div style="margin-top:5px;">';
                p.anhthuchien.forEach((imgBase64, imgIdx) => {
                    let cid = `point_${index}_img_${imgIdx}@baove`;
                    imageHtml += `<img src="cid:${cid}" style="max-width:150px; margin-right:5px; border-radius:4px; border:1px solid #ddd;">`;
                    attachments.push({
                        filename: `chot_${index}_anh_${imgIdx}.jpg`,
                        path: imgBase64,
                        cid: cid
                    });
                });
                imageHtml += '</div>';
            }

            return `
                <div style="padding:10px; border:1px solid #e2e8f0; border-radius:6px; margin-bottom:10px; background-color:#f8fafc;">
                    <b style="color:#1e293b; font-size:15px;">📍 ${p.checkpointName}</b> 
                    <span style="color:#64748b; font-size:12px;">(Quét lúc: ${p.time})</span><br>
                    <i>Khu vực: ${p.khuvuc} - ${p.vitri}</i>
                    ${checklistHtml}
                    <p style="margin:5px 0; font-size:13px; color:#dc2626;"><b>Ghi chú:</b> ${p.comment || 'Không có bất thường'}</p>
                    ${imageHtml}
                </div>
            `;
        }).join('');

        // 2. Xử lý ảnh Selfie nhận ca
        let selfieHtml = '';
        if (patrolData.selfie) {
            attachments.push({ filename: 'selfie.jpg', path: patrolData.selfie, cid: 'selfie_guard' });
            selfieHtml = `<img src="cid:selfie_guard" style="width:120px; height:120px; border-radius:50%; object-fit:cover; border:3px solid #2563eb;">`;
        }

        // 3. Khung HTML Tổng
        let htmlContent = `
            <div style="font-family:Arial,sans-serif; max-width:700px; margin:auto; border:1px solid #dcdcdc; border-radius:8px; padding:20px;">
                <h2 style="color:#2c3e50; text-align:center; border-bottom:2px solid #2563eb; padding-bottom:10px;">BÁO CÁO CA TUẦN TRA AN NINH</h2>
                
                <table style="width:100%; margin-bottom:20px;">
                    <tr>
                        <td style="width:150px; text-align:center;">${selfieHtml}</td>
                        <td style="line-height:1.6;">
                            <p><b>Nhân viên trực:</b> <span style="color:#2563eb; font-size:16px;">${patrolData.guardName} (${patrolData.guardCode})</span></p>
                            <p><b>Thời gian tuần tra:</b> ${patrolData.startTime} - ${patrolData.endTime}</p>
                            <p><b>Ngày trực:</b> ${timeNow}</p>
                            <p><b>Tổng số chốt quét:</b> <span style="background-color:#16a34a; color:white; padding:3px 10px; border-radius:12px; font-weight:bold;">${patrolData.totalPoints} chốt</span></p>
                        </td>
                    </tr>
                </table>
                
                <h3 style="color:#334155;">Chi tiết các điểm kiểm tra:</h3>
                ${pointsHtml}
                
                <hr style="border:0; border-top:1px solid #eee; margin-top:30px;">
                <p style="text-align:center; font-size:12px; color:#94a3b8;">Hệ thống Tuần Tra Tự Động - Diamond Place @2026</p>
            </div>
        `;

        // 4. Lấy config từ ENV và Gửi
        var mailOptions = {
            from: `"Hệ thống An Ninh" <${process.env.HouseFrom}>`,
            to: process.env.BAOVE_EMAIL_TO,
            cc: process.env.BAOVE_EMAIL_CC, // Gửi CC lấy từ ENV
            subject: `[BÁO CÁO TUẦN TRA] Ca trực của ${patrolData.guardName} - Ngày ${timeNow}`,
            html: htmlContent,
            attachments: attachments
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Đã gửi mail báo cáo tuần tra ca của: ${patrolData.guardName}`);

    } catch (error) {
        console.error("❌ Lỗi gửi mail Báo cáo tuần tra:", error);
    }
}

module.exports = { sendPatrolReport };