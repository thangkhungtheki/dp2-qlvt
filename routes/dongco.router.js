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

router.get('/phanloai', async(req, res) => {
    const daynow = moment().format('DD-MM-YYYY');
    const loai = req.query.loai
    const data = await xulydongco.loai_dongco(loai)
    res.render('mainSbAdmin/dongcoview',{
        _username : '',
        daynow: daynow,
        data: data
    
    })
})

router.get('/themdongco', (req, res) => {
    res.render('mainSbAdmin/dongco_them',{_username: ''})
})

router.post('/taodongco', async(req, res) => {
    let ngaymua = moment(req.body.ngaymua,'YYYY-MM-DD')
    let ngayhethan = moment(req.body.ngayhethan,'YYYY-MM-DD')
    let doc = {
        tenthietbi: req.body.tentb,
        loai: req.body.selectloai,
        ngaymua: ngaymua.format('YYYY-MM-DD'),
        ngayhethan: ngayhethan.format('YYYY-MM-DD'),
        vitri: req.body.vitri,
        congsuat: req.body.congsuat,
        model: req.body.model,
        dienap: req.body.dienap,
        ghichu: req.body.ghichu
    }
    //console.log(doc)
    let result = await xulydongco.tao_dongco(doc)
    if(result){
        req.flash('success','đã thêm thành công ' +  doc.tenthietbi)
        const msg = req.flash('success')
        return res.render('mainSbAdmin/dongco_them',{
            _username: '',
            msg
        })
    }else {
        req.flash('not','Lỗi server ... thử lại sau')
        const msge = req.flash('not')
        return res.render('mainSbAdmin/dongco_them',{
            _username: '',
            msge
        })
    }
})

router.post('/xoadongco', async(req, res)=>{
    let id = req.body.id
    const result = await xulydongco.delete_dongco(id)
    // if(result){
    //     return res.redirect('/dongco/view')
    // }else{
        res.end()
    // }
})

router
.get('/suadongco', async (req, res) => {
    let id = req.query.id
    let result = await xulydongco.timdongcotheoID(id)
    if(result){
        return res.render('mainSbAdmin/dongco_sua', {_username: '',data: result})
    }else{
        res.end()
    }
})
.post('/suadongco', async(req, res) => {
    let ngaymua = moment(req.body.ngaymua,'YYYY-MM-DD')
    let ngayhethan = moment(req.body.ngayhethan,'YYYY-MM-DD')
    let doc = {
        tenthietbi: req.body.tentb,
        loai: req.body.selectloai,
        ngaymua: ngaymua.format('YYYY-MM-DD'),
        ngayhethan: ngayhethan.format('YYYY-MM-DD'),
        vitri: req.body.vitri,
        congsuat: req.body.congsuat,
        model: req.body.model,
        dienap: req.body.dienap,
        ghichu: req.body.ghichu
    }
    let id = req.body.id
    let result = await xulydongco.update_dongco(id,doc)
    if(result){
        return res.redirect('/dongco/view')
    }else{
        res.end()
    }
})

module.exports = router