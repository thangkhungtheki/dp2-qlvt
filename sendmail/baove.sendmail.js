const nodemailer = require('nodemailer');
const moment = require('moment');

async function sendPatrolReport(patrolData) {
    try {
        // 1. Cấu hình transporter với mail gửi riêng của Bảo vệ
        const transporter = nodemailer.createTransport({
            host: process.env.HouseHostMail, // Dùng chung Host Server Mail
            port: process.env.HousePort,     // Dùng chung Port
            secure: true,
            auth: {
                user: process.env.BaoveFrom, // Lấy mail gửi của Bảo Vệ
                pass: process.env.BaovePass, // Pass của mail Bảo Vệ
            },
            tls: { rejectUnauthorized: false },
        });

        const timeNow = moment().utcOffset(7).format('DD-MM-YYYY');
        const attachments = [];
        const checkpoints = Array.isArray(patrolData.checkpoints) ? patrolData.checkpoints : [];

        // Đếm số chốt có ghi chú bất thường để làm nổi bật trên đầu báo cáo
        const abnormalCount = checkpoints.filter(p => p.comment && p.comment.trim() !== '').length;

        // 2. Render danh sách các điểm đã tuần tra
        const pointsHtml = checkpoints.map((p, index) => {
            // Render checklist công việc của từng chốt
            let checklistHtml = '';
            if (p.congviec && p.congviec.length > 0) {
                checklistHtml =
                    '<ul style="margin-top:6px; margin-bottom:6px; padding-left:20px; font-size:13px; color:#334155;">' +
                    p.congviec.map(cv => `<li style="margin-bottom:2px;">${cv.isDone ? '✅' : '⬛'} ${cv.name}</li>`).join('') +
                    '</ul>';
            }

            // Xử lý tối đa 5 ảnh minh họa của chốt:
            // - Nếu là URL http/https -> Nhúng trực tiếp (Siêu nhẹ, bấm vào phóng to được)
            // - Nếu là Base64 -> Đưa vào cid attachment (Tương thích ngược)
            let imageHtml = '';
            if (p.anhthuchien && p.anhthuchien.length > 0) {
                imageHtml = '<div style="margin-top:8px;">';
                p.anhthuchien.forEach((imgItem, imgIdx) => {
                    if (!imgItem) return;

                    if (typeof imgItem === 'string' && imgItem.startsWith('http')) {
                        imageHtml += `
                            <a href="${imgItem}" target="_blank" title="Bấm để xem ảnh gốc" style="text-decoration:none; display:inline-block; margin-right:6px; margin-bottom:6px;">
                                <img src="${imgItem}" width="90" height="90" style="width:90px; height:90px; max-width:90px; object-fit:cover; border-radius:4px; border:1px solid #cbd5e1; display:block;">
                            </a>
                        `;
                    } else {
                        const cid = `point_${index}_img_${imgIdx}@baove`;
                        imageHtml += `
                            <img src="cid:${cid}" width="90" height="90" style="width:90px; height:90px; max-width:90px; object-fit:cover; margin-right:6px; margin-bottom:6px; border-radius:4px; border:1px solid #cbd5e1; display:inline-block;">
                        `;
                        attachments.push({
                            filename: `chot_${index + 1}_anh_${imgIdx + 1}.jpg`,
                            path: imgItem,
                            cid: cid
                        });
                    }
                });
                imageHtml += '</div>';
            }

            const hasComment = p.comment && p.comment.trim() !== '';

            return `
                <div style="padding:12px; border:1px solid ${hasComment ? '#fca5a5' : '#e2e8f0'}; border-radius:6px; margin-bottom:10px; background-color:${hasComment ? '#fef2f2' : '#f8fafc'};">
                    <div style="margin-bottom:4px;">
                        <b style="color:#1e293b; font-size:15px;">📍 ${index + 1}. ${p.checkpointName || 'Điểm kiểm tra'}</b>
                        <span style="color:#059669; font-size:12px; font-weight:bold;"> (⏰ Quét lúc: ${p.time || '--:--'})</span>
                    </div>
                    <div style="font-size:12px; color:#64748b; font-style:italic; margin-bottom:4px;">
                        Khu vực: ${p.khuvuc || '-'} | Vị trí: ${p.vitri || '-'}
                    </div>
                    ${checklistHtml}
                    <p style="margin:6px 0 4px 0; font-size:13px; color:${hasComment ? '#dc2626' : '#475569'};">
                        <b>Ghi chú:</b> ${hasComment ? `<b>${p.comment}</b>` : 'Không có bất thường'}
                    </p>
                    ${imageHtml}
                </div>
            `;
        }).join('');

        // 3. Xử lý ảnh Selfie nhận ca (Hỗ trợ cả link URL lẫn Base64)
        let selfieHtml = '';
        if (patrolData.selfie) {
            if (typeof patrolData.selfie === 'string' && patrolData.selfie.startsWith('http')) {
                selfieHtml = `
                    <a href="${patrolData.selfie}" target="_blank" title="Xem ảnh nhận ca">
                        <img src="${patrolData.selfie}" width="80" height="80" style="width:80px; height:80px; border-radius:50%; object-fit:cover; border:3px solid #2563eb; display:block;">
                    </a>
                `;
            } else {
                attachments.push({ filename: 'selfie.jpg', path: patrolData.selfie, cid: 'selfie_guard' });
                selfieHtml = `<img src="cid:selfie_guard" width="80" height="80" style="width:80px; height:80px; border-radius:50%; object-fit:cover; border:3px solid #2563eb; display:block;">`;
            }
        }

        // 4. Khung HTML Tổng
        const htmlContent = `
            <div style="font-family:Arial,sans-serif; max-width:720px; margin:auto; border:1px solid #dcdcdc; border-radius:8px; padding:20px; background-color:#ffffff;">
                <h2 style="color:#1e293b; text-align:center; border-bottom:2px solid #2563eb; padding-bottom:10px; margin-top:0;">
                    BÁO CÁO CA TUẦN TRA AN NINH
                </h2>
                
                <table style="width:100%; margin-bottom:20px; border-collapse:collapse;">
                    <tr>
                        <td style="width:95px; text-align:center; padding-right:15px; vertical-align:middle;">
                            ${selfieHtml}
                        </td>
                        <td style="line-height:1.6; font-size:14px; color:#1e293b;">
                            <p style="margin:2px 0;"><b>Nhân viên trực:</b> <span style="color:#2563eb; font-size:16px; font-weight:bold;">${patrolData.guardName || ''} (${patrolData.guardCode || ''})</span></p>
                            <p style="margin:2px 0;"><b>Thời gian tuần tra:</b> ${patrolData.startTime || '--:--'} - ${patrolData.endTime || '--:--'}</p>
                            <p style="margin:2px 0;"><b>Ngày trực:</b> ${timeNow}</p>
                            <p style="margin:4px 0;">
                                <b>Tổng số chốt quét:</b> 
                                <span style="background-color:#16a34a; color:white; padding:2px 10px; border-radius:12px; font-weight:bold; font-size:13px;">
                                    ${patrolData.totalPoints || checkpoints.length} chốt
                                </span>
                                ${abnormalCount > 0 ? `<span style="background-color:#dc2626; color:white; padding:2px 10px; border-radius:12px; font-weight:bold; font-size:13px; margin-left:6px;">⚠️ ${abnormalCount} chốt có ghi chú</span>` : ''}
                            </p>
                        </td>
                    </tr>
                </table>
                
                <h3 style="color:#334155; font-size:16px; margin-bottom:10px;">
                    Chi tiết các điểm kiểm tra (Bấm vào ảnh để phóng to):
                </h3>
                ${pointsHtml}
                
                <hr style="border:0; border-top:1px solid #e2e8f0; margin-top:25px;">
                <p style="text-align:center; font-size:12px; color:#94a3b8; margin-bottom:0;">
                    Hệ thống Tuần Tra Tự Động - Diamond Place @2026
                </p>
            </div>
        `;

        // 5. Cấu hình người gửi và người nhận
        const mailOptions = {
            from: `"Bảo Vệ DP3" <${process.env.BaoveFrom}>`,
            to: process.env.BaoveEmailTo,
            cc: process.env.BaoveEmailCC,
            subject: `[BÁO CÁO TUẦN TRA] Ca trực của ${patrolData.guardName} - Ngày ${timeNow}`,
            html: htmlContent,
            attachments: attachments // Sẽ rỗng (0KB) nếu toàn bộ ảnh đã được chuyển thành link URL
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Đã gửi mail báo cáo tuần tra ca của: ${patrolData.guardName} (${checkpoints.length} chốt)`);

    } catch (error) {
        console.error("❌ Lỗi gửi mail Báo cáo tuần tra:", error);
    }
}

module.exports = { sendPatrolReport };