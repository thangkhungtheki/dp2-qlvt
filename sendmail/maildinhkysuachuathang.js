const nodemailer = require('nodemailer')
var moment = require('moment')


async function sendmail(data){
    const thang = moment().format('MM-YYYY')
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
        },
        

    });
    var text = ``
    for (let i = 0; i < data.length; i++) {       
        let fullNoidung = data[i].noidunglaychonhanh;
        let tenThietBi = fullNoidung.substring(0, fullNoidung.indexOf(':')); 
        
        // 2. Tạo chuỗi gạch đầu dòng (Sử dụng <li>)
        let string = `
            <li>
                <b>Thiết bị: </b><span style='color: blue'>${tenThietBi}</span> <br>
                
                <span style="color: green; font-weight: bold;"> &nbsp; &nbsp; Ngày ${data[i].ngay}:</span> 
                <span style="color: #4B0082;">${data[i].noidung}</span>
            </li>
        `;

        text = text + string;
    }
    var content = '';
    var _html = `
        </div>
    </div>
    `
    var maillist = [
        'help-enom@gkcentralhotel.com',
        'it@diamondplace.com.vn',
        
      ];
      
      
    content = text ;
    if(content != ''){
        var mainOptions = { // thiết lập đối tượng, nội dung gửi mail
            from: process.env.emailFrom,
            to: process.env.mailList,
            //bcc: 'it@diamondplace.com.vn',
            subject: "DP1 SỬA CHỮA ĐỊNH KỲ THÁNG " + thang,
            //text: 'Your text is here',//Thường thi mình không dùng cái này thay vào đó mình sử dụng html để dễ edit hơn
            html: content ,//Nội dung html mình đã tạo trên kia :)),
            
        }
        transporter.sendMail(mainOptions, function(err, info){
            if (err) {
                console.log(err);
                return err
            } else {
                console.log('Message sent: ' +  'send mail Success');
                return true
            }
        });
    }else{

    }
}

module.exports = {
    sendmail
}