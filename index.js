var app = require("./app")

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
// var http = require("http")

// var server = http.createServer(app)

//server.listen(4000)

https.createServer(options, app).listen(3000);
//http.createServer(app).listen(3001)
// app.listen(3000,()=>{  
//     console.log("Server run port 3000")
// })
