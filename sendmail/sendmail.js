const nodemailer = require('nodemailer')
var moment = require('moment')
<<<<<<< HEAD

=======
>>>>>>> d387aec9d2cc818b7ef3af66669c64df726255da

function sendmail(data){

    var transporter =  nodemailer.createTransport({ // config mail server
        host: process.env.hostEmail,
        port: process.env.portEmail,
        type: 'login',
        secure: true,
        auth: {
            user: process.env.emailFrom, //T�i kho?n gmail v?a t?o
            pass: process.env.emailPass, //M?t kh?u t�i kho?n gmail v?a t?o
        },
        tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false
        },
        

    });
    var text = ``
    for (let i = 0; i < data.length; i++) {
        
        if( data[i].songayhethan <= 30 && data[i].songayhethan > 0 ){
            
            var string = '<b>.T�n: ' + `</b><span style='color: blue'>` + data[i].tentb + ` </span>
                            <span>` + ` ---day: </span>
                            <span style="color: red">` + data[i].songayhethan + ` ng�y </span> <br>`
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
      
      
<<<<<<< HEAD
    content = text ;
=======
    content = text;
>>>>>>> d387aec9d2cc818b7ef3af66669c64df726255da
    if(content != ''){
        var mainOptions = { // thi?t l?p d?i tu?ng, n?i dung g?i mail
            from: process.env.emailFrom,
            to: process.env.mailList,
            //bcc: 'it@diamondplace.com.vn',
            subject: process.env.subject,
            //text: 'Your text is here',//Thu?ng thi m�nh kh�ng d�ng c�i n�y thay v�o d� m�nh s? d?ng html d? d? edit hon
            html: content ,//N?i dung html m�nh d� t?o tr�n kia :)),
            
        }
    
        transporter.sendMail(mainOptions, function(err, info){
            if (err) {
                console.log(err);
                
            } else {
                console.log('Message sent: ' +  info.response);
            }
        });
    }else{
<<<<<<< HEAD
        
        let daynow = moment().format('YYYY-MM-DD')
        console.log('Date: ' + daynow +' ko co het han')
        // content = 'test mail'
        // var mainOptions = { // thi?t l?p d?i tu?ng, n?i dung g?i mail
        //     from: process.env.emailFrom,
        //     to: process.env.mailList,
        //     //bcc: 'it@diamondplace.com.vn',
        //     subject: process.env.subject,
        //     //text: 'Your text is here',//Thu?ng thi m�nh kh�ng d�ng c�i n�y thay v�o d� m�nh s? d?ng html d? d? edit hon
        //     html: content ,//N?i dung html m�nh d� t?o tr�n kia :)),
            
        // }
        // transporter.sendMail(mainOptions, function(err, info){
        //     if (err) {
        //         console.log(err);
                
        //     } else {
        //         console.log('Message sent: ' +  info.response);
        //     }
        // });
=======
        let daynow = moment().format('YYYY-MM-DD')
        console.log('Date: ' + daynow +'Ko có hết hạn')
>>>>>>> d387aec9d2cc818b7ef3af66669c64df726255da
    }

    
}

module.exports = {
    sendmail
}