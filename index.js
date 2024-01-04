var app = require("./app")
<<<<<<< HEAD
const https = require('https');
const fs = require('fs');

//Chuyen cac ket noi http sang https 

const privateKey = fs.readFileSync('sslkey/private.key', 'utf8');
const certificate = fs.readFileSync('sslkey/certificate.crt', 'utf8');
const credentials = { key: privateKey, cert: certificate };


=======

var forceSSL = require('express-force-ssl');
app.use(forceSSL)
// app.set('forceSSLOptions', {
//   httpsPort: 3000
// });
// var http = require('http');
const https = require('https');
var fs = require('fs');
var options = {
  key: fs.readFileSync('certificates/app.diamondplace.vn/private.key'),
  cert: fs.readFileSync('certificates/app.diamondplace.vn/certificate.crt'),
  ca: fs.readFileSync('certificates/app.diamondplace.vn/ca_bundle.crt')
};
>>>>>>> d387aec9d2cc818b7ef3af66669c64df726255da
// var http = require("http")

// var server = http.createServer(app)

//server.listen(4000)

<<<<<<< HEAD
const server = https.createServer(credentials, app);
app.listen(3979,()=>{
    console.log("Server run port 3979")
})

=======
https.createServer(options, app).listen(3000);
//http.createServer(app).listen(3001)
// app.listen(3000,()=>{  
//     console.log("Server run port 3000")
// })
>>>>>>> d387aec9d2cc818b7ef3af66669c64df726255da
