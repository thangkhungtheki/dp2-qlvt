var app = require("./app")
const https = require('https');
const fs = require('fs');

//Chuyen cac ket noi http sang https 

var options = {
	key: fs.readFileSync('sslkey/private.key', 'utf8'),
	cert: fs.readFileSync('sslkey/certificate.crt', 'utf8'),
	ca:  fs.readFileSync('sslkey/ca_bundle.crt', 'utf8'),
}


const privateKey = fs.readFileSync('sslkey/private.key', 'utf8');
const certificate = fs.readFileSync('sslkey/certificate.crt', 'utf8');
const credentials = { key: privateKey, cert: certificate };


// var http = require("http")

// var server = http.createServer(app)

//server.listen(4000)

const server = https.createServer(options, app);
server.listen(3980,()=>{
    console.log("Server run port 3980")
})

