var express = require("express")
var router =  express.Router()

router.get('/', (req, res) => {
    const ip = req.ip
    const userAgent = req.get('User-Agent')
    res.send({
        ip: ip,
        useragent: userAgent
    })
})

module.exports = router