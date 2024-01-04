var app = require("./app")
const https = require('https');
const fs = require('fs');

//Chuyen cac ket noi http sang https 

const privateKey = fs.readFileSync('sslkey/private.key', 'utf8');
const certificate = fs.readFileSync('sslkey/certificate.crt', 'utf8');
const credentials = { key: privateKey, cert: certificate };


// var http = require("http")

// var server = http.createServer(app)

//server.listen(4000)

const server = https.createServer(credentials, app);
app.listen(3979,()=>{
    console.log("Server run port 3979")
})

