var express = require("express")
var router =  express.Router()
const useragent = require('express-useragent');
router.use(useragent.express())
router.get('/', (req, res) => {
    const { isMobile, isDesktop, browser, platform, version, os } = req.useragent
    res.render('checkinfoclient/infoclient', {
    userAgent: req.get('User-Agent'),
    ip:req.ip,
    isMobile,
    isDesktop,
    browser,
    platform,
    version,
    os
  });
})

module.exports = router