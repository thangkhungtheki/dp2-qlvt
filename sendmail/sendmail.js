const nodemailer = require('nodemailer')


function sendmail(){

    var transporter =  nodemailer.createTransport({ // config mail server
        host: process.env.hostEmail,
        port: process.env.portEmail,
        type: 'login',
        secure: true,
        auth: {
            user: process.env.emailFrom, //Tài khoản gmail vừa tạo
            pass: process.env.emailPass, //Mật khẩu tài khoản gmail vừa tạo
        },
        tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false
        }
    });
    var content = '';
    var _html = `
    <div style="padding: 10px; background-color: #003375">
        <div style="padding: 10px; background-color: white;">
            <h4 style="color: #0085ff">Gửi mail với nodemailer và express</h4>
            <span style="color: black">Đây là mail test</span> <br>
            <span style="color: green">` + ` Thân Chào anh/chị: `+ 'là file Duy Tân' + `</span>
        </div>
    </div>
    `
    content += _html;
    var mainOptions = { // thiết lập đối tượng, nội dung gửi mail
        from: process.env.emailFrom,
        to: process.env.emailTo,
        subject: process.env.subject,
        //text: 'Your text is here',//Thường thi mình không dùng cái này thay vào đó mình sử dụng html để dễ edit hơn
        html: content ,//Nội dung html mình đã tạo trên kia :)),
    }

    transporter.sendMail(mainOptions, function(err, info){
        if (err) {
            console.log(err);
            
        } else {
            console.log('Message sent: ' +  info.response);
        }
    });
}

module.exports = {
    sendmail
}