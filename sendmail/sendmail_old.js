const nodemailer = require('nodemailer')


function sendmail(data){

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
        
        if( data[i].songayhethan <= 30 && data[i].songayhethan > 0 ){
            
            var string = '<b>.Tên: ' + `</b><span style='color: blue'>` + data[i].tentb + ` </span>
                            <span>` + ` ---day: </span>
                            <span style="color: red">` + data[i].songayhethan + ` ngày </span> <br>`
            text = text + string
           
        }
        
         
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
      
      
    content = text + _html;
    if(content != ''){
        var mainOptions = { // thiết lập đối tượng, nội dung gửi mail
            from: process.env.emailFrom,
            to: process.env.mailList,
            //bcc: 'it@diamondplace.com.vn',
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
    }else{
        console.log('Ko có hết hạn')
    }

    
}

module.exports = {
    sendmail
}