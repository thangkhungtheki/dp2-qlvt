const nodemailer = require('nodemailer')
var moment = require('moment')


function sendmail(params){
    var emailpb = ""
    // switch (params[0].bophan) {
    //     case "bep":
    //         emailpb = " , bep.dp2@diamondplace.com.vn"
    //         break;
    //     case "sales":
    //         emailpb = " , nt.dung@diamondplace.com.vn"
    //         break;
    //     case "fb":
    //         emailpb = " , fb.manager.dp2@diamondplace.com.vn"
    //         break;
    //     case "ketoan":
    //         emailpb = " , Chiefaccountant.dp2@diamondplace.com.vn"
    //         break;
    //     case "marketing":
    //         emailpb = " , Marketing.Ma@diamondplace.com.vn"
    //         break;
    //     case "avtrangtri":
    //         emailpb = " , tn.thuan@diamondplace.com.vn"
    //         break;
    //     case "house":
    //         emailpb = " , House.Keeper@diamondplace.com.vn"
    //         break;
    //     case "baove":
    //         emailpb = " , sec.ma@diamondplace.com.vn"
    //         break;
    //     case "nhansu":
    //         emailpb = " , tb.dung@diamondplace.com.vn"
    //         break;        
    //     default:
    //         break;
    // }

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
    var content = 
`<b>Phiếu yêu cầu mới</b><br><b>Mã yêu cầu: </b>`+ params[0].mayeucau + `<br>
Bộ phận: <b>` + params[0].bophan + `</b> <br>
Mô tả: <span style="color: blue">` + params[0].mota + `</span> <br>
Khẩn cấp: <b>` + params[0].khancap + `</b> <br>
Trạng thái trưởng bộ phận : <span style="color: blue"> Duyệt </span>`
    // console.log(params)
    // console.log(content)
    if(content != ''){
        var senttoemail = process.env.mailList + emailpb
        // console.log(senttoemail)
        var mainOptions = { // thiết lập đối tượng, nội dung gửi mail
            from: process.env.emailFrom,
            to: senttoemail,
            //bcc: 'it@diamondplace.com.vn',
            subject: "THÔNG BÁO CÓ PHIẾU YÊU CẦU MỚI",
            //text: 'Your text is here',//Thường thi mình không dùng cái này thay vào đó mình sử dụng html để dễ edit hơn
            html: content ,//Nội dung html mình đã tạo trên kia :)),
            
        }
    try {
        transporter.sendMail(mainOptions, function(err, info){
            if (err) {
                console.log('>>>Lỗi transproter: ', err);
                
            } else {
                console.log('Message sent: ' +  'send mail Success');
            }
        });
    } catch (error) {
        console.log(error)
    }
        
        
    }else{
        
        let daynow = moment().format('YYYY-MM-DD')
        console.log('Date: ' + daynow +'Ko có hết hạn')
        // content = 'test mail'
        // var mainOptions = { // thiết lập đối tượng, nội dung gửi mail
        //     from: process.env.emailFrom,
        //     to: process.env.mailList,
        //     //bcc: 'it@diamondplace.com.vn',
        //     subject: process.env.subject,
        //     //text: 'Your text is here',//Thường thi mình không dùng cái này thay vào đó mình sử dụng html để dễ edit hơn
        //     html: content ,//Nội dung html mình đã tạo trên kia :)),
            
        // }
        // transporter.sendMail(mainOptions, function(err, info){
        //     if (err) {
        //         console.log(err);
                
        //     } else {
        //         console.log('Message sent: ' +  info.response);
        //     }
        // });
    }

    
}

module.exports = {
    sendmail
}