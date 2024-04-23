var express = require("express")
var router =  express.Router()
var xulydongco = require('../CRUD/db.dongco')
var moment = require('moment')

router.get('/view', async(req, res) => {
    const daynow = moment().format('DD-MM-YYYY');
    const data = await xulydongco.doc_dongco()
    res.render('mainSbAdmin/dongcoview',{
        _username : '',
        daynow: daynow,
        data: data
    
    })
})

router.get('/themdongco', (req, res) => {
    res.render('mainSbAdmin/dongco_them',{_username: ''})
})

module.exports = router