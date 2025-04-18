﻿var express = require("express")
var router =  express.Router()
var passport = require("../config/passport")
var xulydb = require("../CRUD/xulydb")
var moment = require('moment')
const toolmongo = require("../tool_mongo/backup")
const sendmail = require('../sendmail/sendmail')
const exceljs = require('exceljs');
const fs = require('fs')

//sendmail.sendmail()

const ycsc = require('../CRUD/xulyyeucau')

// Middleware để thiết lập dữ liệu trong res.locals
router.use(async (req, res, next) => {
  let total = await tongsuachuaton()
  res.locals.arrayTong = total
  next();
});
async function tongsuachuaton() {
  let bep = await ycsc.timyctheobophan('bep')
  let sales = await ycsc.timyctheobophan('sales')
  let marketing = await ycsc.timyctheobophan('marketing')
  let fb = await ycsc.timyctheobophan('fb')
  let ketoan = await ycsc.timyctheobophan('ketoan')
  let av = await ycsc.timyctheobophan('avtrangtri')
  let house = await ycsc.timyctheobophan('house')
  let nhansu = await ycsc.timyctheobophan('nhansu')
  let baove = await ycsc.timyctheobophan('baove')
  let khac = await ycsc.timyctheobophan('khac')
  let total = {
    bep: bep.length,
    sales: sales.length,
    marketing: marketing.length,
    fb: fb.length,
    ketoan: ketoan.length,
    av: av.length,
    house: house.length,
    nhansu: nhansu.length,
    baove: baove.length,
    khac: khac.length
  }
  return total
}

router.get('/cronjobsendmail',async(req, res) => {
    var data =  await xulydb.doc_createthietbi()
    var newdata = await tinhngayconlai(data)
    sendmail.sendmail(newdata)
    res.status(200).send('ok');

})

router.get("/", (req, res, next) => {
    res.redirect("/signin")
})

router.get('/.well-known/pki-validation/32E58AB3EEC936EDF6D79C8FD615AC68.txt' , (req, res) => {
	return res.sendfile('public/32E58AB3EEC936EDF6D79C8FD615AC68.txt')
})
 
router.post("/signin",
    passport.authenticate('local.signin', { successRedirect: '/qlkt',
                                  failureRedirect: '/signin',
                                  failureFlash: true })
);

router.post("/signup", 
passport.authenticate('local.signup', { successRedirect: '/signin',
                                  failureRedirect: '/signup',
                                  failureFlash: true })
);

/* GET sign-up page. */
router.get('/signup', function(req, res, next) {
    var messages = req.flash('error')
   
    return res.render('signup',{ 
      messages: messages,
      hasErrors: messages.length > 0,
     })
  });
router.get("/signin", (req, res , next) => {
    // hien thi trang va truyen lai nhung tin nhan tu phia server neu co
    var messages = req.flash('error')
    return res.render("signin",{
        messages: messages,
        hasErrors: messages.length > 0
    })
})
//-------------------TEST------------------------------------

// const originalDate = moment('2020-04-10');
// console.log('Ngày tháng năm ban đầu:', originalDate.format('YYYY-MM-DD'));
// const monthsToAdd = 14;

// const newDate = originalDate.add(monthsToAdd, 'months');


// console.log('Số tháng được cộng thêm:', monthsToAdd);
// console.log('Ngày tháng năm mới:', newDate.format('YYYY-MM-DD'));

// const startDate = moment('2023-01-10');
// const endDate = moment('2023-12-31');

// const daysDifference = endDate.diff(startDate, 'days');

// console.log('Ngày tháng năm bắt đầu:', startDate.format('YYYY-MM-DD'));
// console.log('Ngày tháng năm kết thúc:', endDate.format('YYYY-MM-DD'));
// console.log('Số ngày giữa hai ngày:', daysDifference);

// const daynow = moment().format('YYYY-MM-DD')
// console.log('Ngày hiện tại của local máy tính: ', daynow)

//-------------------TEST------------------------------------

router
    .get('/createthietbi',(req, res) => {
        if(req.isAuthenticated()){        
            return res.render('mainSbAdmin/createthietbi',{
                    _username: req.user.username,
                    data: 'data',
                    activeuser: 'active',
                    activetb: '',
                    activetbdp2: '',
                    
                    
            })
        }else{
            res.redirect("/signin")
        }
})

    .post('/themcreatethietbi',(req, res) => {
        if(req.isAuthenticated()){ 
            var nnhap = moment(req.body.ngaynhap) 
            var sothang = req.body.timehethan
            const nhethan = nnhap.add(sothang, 'months')
            var data = {          
                    username: req.user.username,
                    tentb: req.body.tentb,
                    dvt: req.body.dvt,
                    soluong: req.body.soluong,
                    ngaynhap: req.body.ngaynhap,
                    timehethan: req.body.timehethan,
                    ngayhethan: nhethan.format('YYYY-MM-DD'),
                    tenncc: req.body.tenncc,
                    sdtncc: req.body.sdtncc,
                    tinhtrang: req.body.tinhtrang,
                    ghichu: req.body.ghichu,    
            }
            try{
                xulydb.them_createthietbi(data)
                res.redirect('/createthietbi')
            }catch{e=>{
                return res.send(e)
            }} 
        }else{
            res.redirect("/signin")
        }  
})

router.post('/xoathietbi', async(req, res) => {
    if(req.isAuthenticated()){
        let tentb = req.body.tentb
        await xulydb.xoa_createthietbi(tentb)
        res.end()
    }else{
        res.redirect("/signin")
    }    
})

router
.get('/suacreatethietbi', async(req, res) => {
    let tentb = req.query.tentb
    //console.log(tentb)
    if(req.isAuthenticated()){
        var data = await xulydb.tim_createthietbi(tentb)
        
        //var _adata = JSON.stringify(data)
        //console.log(_adata)
        //console.log(data)
        //console.log(newdata)
            return res.render("mainSbAdmin/createthietbi-sua",{
            _username: req.user.username,
            data: data,
            activeuser: '',
            activetb: '',
            activetbdp2: 'active',
            
        })
        
    }else{
        res.redirect("/signin")
    }
})
.post('/suacreatethietbi', async(req, res) => {
    if(req.isAuthenticated()){ 
        var nnhap = moment(req.body.ngaynhap)
        var sothang = req.body.timehethan
        const nhethan = nnhap.add(sothang, 'months')
        
        var data = {          
                username: req.user.username,
                tentb: req.body.tentb,
                dvt: req.body.dvt,
                soluong: req.body.soluong,
                ngaynhap: req.body.ngaynhap,
                timehethan: req.body.timehethan,
                tenncc: req.body.tenncc,
                sdtncc: req.body.sdtncc,
                tinhtrang: req.body.tinhtrang,
                ghichu: req.body.ghichu,    
                ngayhethan: nhethan.format('YYYY-MM-DD'),
        }
        try{
            // console.log(data)
            await xulydb.sua_createthietbi(data.tentb, data)
            res.redirect('/viewcreatethietbi')
        }catch{e=>{
            return res.send(e)
        }} 
    }else{
        res.redirect("/signin")
    }  
})

router.get('/viewcreatethietbi', async(req, res) => {
    if(req.isAuthenticated()){
        var data = await xulydb.doc_createthietbi()
        var newdata = await tinhngayconlai(data)
        const daynow = moment().format('DD-MM-YYYY');
        //console.log(newdata)
            return res.render("mainSbAdmin/createthietbiview",{
            _username: req.user.username,
            data: newdata,
            activeuser: '',
            activetb: '',
            activetbdp2: 'active',
            daynow: daynow
        })
    }else{
        res.redirect("/signin")
    }
})

async function tinhngayconlai(data){
    var newdata = []
    
    // data.forEach(element => {
    //     const daynow = moment().format('YYYY-MM-DD')
    //     const songay = moment(element.ngayhethan).diff(daynow, 'days');
    //     console.log('Data số ngày: ',songay)
    //     element['soooooooo'] = 'ccacccaaaccacaccac'
    //     newdata.push(element)
    //     console.log(element)
    // });

    // const newArray = await data.map((e,i)=>{
    //     const daynow = moment().format('YYYY-MM-DD')
    //     const songay = moment(e.ngayhethan).diff(daynow, 'days');
    //     console.log('Data số ngày: ',songay)
    //     const update_e = {...e, ['songayconlai']: songay, i }
    //     return update_e
    // })

    for (let i = 0; i < data.length; i++) {
        let daynow = moment().format('YYYY-MM-DD');
        let songay = moment(data[i].ngayhethan).diff(daynow, 'days');
        //console.log('Data số ngày: ',songay);
        data[i].songayhethan = songay - 1;
        newdata.push(data[i])
       }

    return newdata
}



router.get('/dashboard', async(req, res) => {
    if(req.isAuthenticated()){
        if(await xulydb.find(req.user.username)){
            let data = await xulydb.docUser()
        //console.log(data)
            return res.render("mainSbAdmin/dashboard",{ 
            _username: req.user.username,
            data: data,
            activeuser: 'active',
            activetb: '',
            activetbdp2: '',
            })
        }else res.redirect("/thietbi")
        
    }else{
        res.redirect("/signin")
    }
})

router.get('/thietbi', async(req, res) => {
    if(req.isAuthenticated()){
        let data = await xulydb.docTb()
            return res.render("mainSbAdmin/dbthietbi",{
            _username: req.user.username,
            data: data,
            activeuser: '',
            activetb: 'active',
            activetbdp2: '',
        })
    }else{
        res.redirect("/signin")
    }
})
var dat = {
    Ma: "",
    Mainboard: "",
    RAM: "",
    CPU: "",
    HardDisk: "",
    Monitor: "",
    VideoCard: "",
    OS: "",
    Notes: "",
    BoPhan: "",
    DeXuat: "",
    Loai: "",
    Nguoidung: "",
    Vitri: "",
}
router.get('/editthietbi', async(req, res) => {
    return res.render("mainSbAdmin/dbthietbi-edit",{
        _username: req.user.username,
        activeuser: '',
        activetb: '',
        activetbdp2: 'active',
        data: dat,
    })
    // if(req.isAuthenticated()){
        
    //         return res.render("mainSbAdmin/dbthietbi-edit",{
    //         _username: req.user.username,
    //         activeuser: '',
    //         activetb: '',
    //         activeedittb: 'active',
    //         Ma: req.params.id,
            
    //     })
    // }else{
    //     res.redirect("/signin")
    // }
})

router.get('/thietbidp2', async(req, res) => {
    if(req.isAuthenticated()){
        let data = await xulydb.docTbdp2()
            return res.render("mainSbAdmin/dbthietbidp2",{
            _username: req.user.username,
            data: data,
            activeuser: '',
            activetb: '',
            activetbdp2: 'active',
        })
    }else{
        res.redirect("/signin")
    }
    
})

router.post('/suatb', async(req, res) => {
    return res.render("mainSbAdmin/dbthietbi-edit",{
            _username: req.user.username,
            activeuser: '',
            activetb: '',
            activeedittb: 'active',
            Ma: req.body.code,
})
})

router.post('/suatbdp2', async(req, res) => {
    return res.render("mainSbAdmin/dbthietbi-edit-dp2",{
            _username: req.user.username,
            activeuser: '',
            activetb: '',
            activeedittb: '',
            activetbdp2: '',
            Ma: req.body.code,
})
})

router.post('/delete', async(req, res) => {
    if(req.isAuthenticated()){
        let a = await xulydb.xoaTb(req.body.Ma)
        if(a == true){
            res.redirect("/thietbi")
        }else{
            return res.send("Loi khong xoa duoc")
        }
        
               
    }else{
        res.redirect("/signin")
    }
       
})

router.post('/deletedp2', async(req, res) => {
    if(req.isAuthenticated()){
        let a = await xulydb.xoaTbdp2(req.body.Ma)
        if(a == true){
            res.redirect("/thietbidp2")
        }else{
            return res.send("Loi khong xoa duoc")
        }
        
               
    }else{
        res.redirect("/signin")
    }
       
})

router.post('/searchedit', async(req, res) => {
    //console.log(req.body.txtsearch)
    let doc =  await xulydb.timTb(req.body.txtsearch)
    if(doc){
        //console.log(doc)
        return res.render("mainSbAdmin/dbthietbi-edit",{
            _username: req.user.username,
            activeuser: '',
            activetb: '',
            activeedittb: 'active',
            activetbdp2: '',
            data: doc,
})
    }else{
        return res.render("mainSbAdmin/dbthietbi-edit",{
            _username: req.user.username,
            activeuser: '',
            activetb: '',
            activeedittb: 'active',
            activetbdp2: '',
            data: dat,
        })
    }
    
    
})

router.post('/searcheditdp2', async(req, res) => {
    //console.log(req.body.txtsearch)
    let id = req.body.txtsearch
    let doc =  await xulydb.timTbdp2(id)
    //console.log(req.body.txtsearch)
    if(doc){
        //console.log(doc)
        return res.render("mainSbAdmin/dbthietbi-edit-dp2",{
            _username: "",
            activeuser: '',
            activetb: '',
            activeedittb: 'active',
            activetbdp2: '',
            data: doc,
})
    }else{
        return res.render("mainSbAdmin/dbthietbi-edit-dp2",{
            _username: "",
            activeuser: '',
            activetb: '',
            activeedittb: 'active',
            activetbdp2: '',
            data: dat,
        })
    }
    
    
})

router.get("/themthietbi", (req, res) => {
    if(req.isAuthenticated()){
            return res.render("mainSbAdmin/themthietbi",{
            _username: req.user.username,
            activeuser: '',
            activetb: '',
            activeedittb: '',
            activetbdp2: '',
            activethem: '',
        })
    }else{
        res.redirect("/signin")
    }
})

router.get("/themthietbidp2", (req, res) => {
    if(req.isAuthenticated()){
            return res.render("mainSbAdmin/themthietbidp2",{
            _username: req.user.username,
            activeuser: '',
            activetb: '',
            activetbdp2: '',
            activethem: 'active',
            
        })
    }else{
        res.redirect("/signin")
    }
})

router.post("/themtb",(req, res) => {
    let doc = {
        Ma: req.body.txtma,
        Mainboard: req.body.txtmain,
        RAM: req.body.txtram,
        CPU: req.body.txtcpu,
        HardDisk: req.body.txthdd,
        Monitor: req.body.txtmonitor,
        VideoCard: req.body.txtvideo,
        OS: req.body.txtOS,
        Notes: req.body.txtnotes,
        BoPhan: req.body.txtbophan,
        DeXuat: req.body.txtdexuat,
        Loai: req.body.txtloai,
        Nguoidung: req.body.txtnguoidung,
        Vitri: req.body.txtvitri,
    }
    xulydb.themtb(doc)
    res.redirect("/themthietbi")
})

router.post("/themtbdp2",(req, res) => {
    let doc = {
        Ma: req.body.txtma,
        Mainboard: req.body.txtmain,
        RAM: req.body.txtram,
        CPU: req.body.txtcpu,
        HardDisk: req.body.txthdd,
        Monitor: req.body.txtmonitor,
        VideoCard: req.body.txtvideo,
        OS: req.body.txtOS,
        Notes: req.body.txtnotes,
        BoPhan: req.body.txtbophan,
        DeXuat: req.body.txtdexuat,
        Loai: req.body.txtloai,
        Nguoidung: req.body.txtnguoidung,
        Vitri: req.body.txtvitri,
    }
    xulydb.themtbdp2(doc)
    res.redirect("/themthietbidp2")
})

router.post("/capnhat",(req, res) => {
    //console.log(req.body)
    let doc = {
        Mainboard: req.body.txtmain,
        RAM: req.body.txtram,
        CPU: req.body.txtcpu,
        HardDisk: req.body.txthdd,
        Monitor: req.body.txtmonitor,
        VideoCard: req.body.txtvideo,
        OS: req.body.txtOS,
        Notes: req.body.txtnotes,
        BoPhan: req.body.txtbophan,
        DeXuat: req.body.txtdexuat,
        Loai: req.body.txtloai,
        Nguoidung: req.body.txtnguoidung,
        Vitri: req.body.txtvitri,
    }
    xulydb.updatetb(req.body.txtma,doc)
    res.redirect('/thietbi')
})

router.post("/capnhatdp2",(req, res) => {
    //console.log(req.body)
    let doc = {
        Ma: req.body.txtma,
        Mainboard: req.body.txtmain,
        RAM: req.body.txtram,
        CPU: req.body.txtcpu,
        HardDisk: req.body.txthdd,
        Monitor: req.body.txtmonitor,
        VideoCard: req.body.txtvideo,
        OS: req.body.txtOS,
        Notes: req.body.txtnotes,
        BoPhan: req.body.txtbophan,
        DeXuat: req.body.txtdexuat,
        Loai: req.body.txtloai,
        Nguoidung: req.body.txtnguoidung,
        Vitri: req.body.txtvitri,
    }
    // console.log('Req>>>',req.body.txtid)
    xulydb.updatetbdp2(req.body.txtid,doc)
    res.redirect('/thietbidp2')
})

router.post('/logout',(req, res) => {
    req.session.destroy()
    res.redirect('/signin')
})
var activedata = {
    activeuser: '',
    activetb: '',
    activetbdp2: '',
    activethem: 'active',
}
router.get('/vattutest', (req, res) => {
    if(req.isAuthenticated()){
        return res.render("mainSbAdmin/vattu.ejs", {
            
            user: req.user,
            _username: "",
            activeuser: '',
            activetb: '',
            activetbdp2: '',
            activethem: 'active',
            
            
        })
    }else{
        res.redirect('signin')
    }
})

router.post('/timvattubyloai', async (req, res) => {
    let Loaivt = req.body.loai
    let doc = await xulydb.timvattu(Loaivt)
    return res.send(doc)
})

router.post('/luunhapvattu', async(req, res) => {
    let doc = {
        Ma_vattu: req.body.Ma_vattu,
        Tenvattu: req.body.Tenvattu,
        username: req.user.username,
        ngaynhap: req.body.ngaynhap,
        soluong: req.body.soluong,
        ghichu: req.body.ghichu,
        loai: req.body.loai,
        
    }
    console.log(doc)
    
    await xulydb.luunhapvattu(doc)
    res.redirect('/vattutest')
})

router.get('/xuatvattutest', (req, res) => {
    // let slton = await 
    if(req.isAuthenticated()){
        return res.render("mainSbAdmin/xuatvattu.ejs", {
            user: req.user, //tạm mở user
            _username: "",
            activeuser: '',
            activetb: '',
            activetbdp2: '',
            activethem: '',
            
        })
    }else{
        res.redirect('signin')
    }
})

router.post('/luuxuatvattu', async(req, res) => {
    let doc = {
        Ma_vattu: req.body.Ma_vattu,
        Tenvattu: req.body.Tenvattu,
        username: req.user.username,
        ngayxuat: req.body.ngayxuat,
        soluong: req.body.soluong,
        lydoxuat: req.body.lidoxuat,
        loai: req.body.loai,
    }
    console.log(doc)
    
    await xulydb.luuxuatvattu(doc)
    res.redirect('/xuatvattutest')
})

router.get('/mavattutest', (req, res) => {
    if(req.isAuthenticated()){
        return res.render("mainSbAdmin/themmavattu.ejs", {
        
            user: req.user, //tạm mở user
            _username: "",
            activeuser: '',
            activetb: '',
            activetbdp2: '',
            activethem: '',
                 
        })
    }else{
        res.redirect('signin')
    }   
})

router.post('/luumavattu', async(req, res) => {
    let doc = {
        Ma_vattu: req.body.mavattu,
        Tenvattu: req.body.tenvattu,
        Loaivattu: req.body.loaivattu,
        
    }
    console.log(doc)
    
    await xulydb.luumavattu(doc)
    res.redirect('/mavattutest')
})

router.get('/timnhap', async(req, res) => {
    let soluong = await xulydb.timnhap('dl-04')
    console.log(soluong)
    return res.send(200, soluong)
})

router.get('/timton/:ma', async(req, res) => {
    let ma = req.params.ma
    let slnhap = await xulydb.timnhap(ma)
    console.log('số lương nhập: ' + slnhap)
    let slxuat =  await xulydb.timxuat(ma)
    console.log('Số lượng xuất: ' + slxuat)
    let slton = slnhap - slxuat
    return res.send({
        slxuat: slxuat,
        slnhap: slnhap,
        slton: slton,
    })
})

router.get('/baocaovattu', async (req, res) => {

    if (req.isAuthenticated()) {
        let data = await xulydb.baocaovattu()
        //console.log(data)
        return res.render("mainSbAdmin/baocaovattu.ejs", {

            user: req.user, //tạm mở user
            
            activeuser: '',
            activetb: '',
            activetbdp2: '',
            activethem: '',
            data: data,

        })
    } else {
        res.redirect('signin')
    }

})

//---------------------------------------------------

router.get('/chart', (req, res) => {
    return res.render("mainSbAdmin/main-chart.ejs",{
        user: req.user, //tạm mở user
        
        activeuser: '',
        activetb: '',
        activetbdp2: '',
        activethem: '',
        
    })

})
router.get('/chitiettheoma', async(req, res) => {

    if (req.isAuthenticated()) {
        let data = await xulydb.baocaovattu()
        //console.log(data)
        return res.render("mainSbAdmin/chitiettheoma_tenuser",{
            user: req.user, //tạm mở user
            
            activeuser: '',
            activetb: '',
            activetbdp2: '',
            activethem: '',
            
        })
    
    } else {
        res.redirect('signin')
    }

})

router.post('/timxuatvattu', async(req, res) => {
    let data = await xulydb.timxuatvattu(req.body.loai)
    return res.send(data)
})

router.get('/viewdevices',authenticated, async(req, res) => {
   
    //console.log(data[0]._id)
    return res.render("mainSbAdmin/main_create_devices",{
        _username: req.user.username,
        
        activeuser: '',
        activetb: '',
        activetbdp2: '',
        
    })
})

router.get('/viewdevices1',authenticated, async(req, res) => {
    let data = await xulydb.docdevices()
    //console.log(data[0]._id)
    return res.render("mainSbAdmin/view_devices",{
        _username: req.user.username,
        data: data,
        activeuser: '',
        activetb: '',
        activetbdp2: '',
        
    })
})

router.post('/create_device',authenticated, async(req, res) => {
    let doc = {
        name: req.body.name,
        location: req.body.location,
        power: req.body.power,
        modem: req.body.modem,
        note: req.body.note,
        username: req.user.username,
    }
    //console.log(doc)
    let result = await xulydb.create_device(doc)
    // if(result){
        res.redirect('/viewdevices')
    // }
})

router.post('/delete_device', authenticated, async(req, res) => {
    let id = req.body.id
    let result = await xulydb.delete_device(id)
    res.redirect('/viewdevices1')
})

router.get('/update_device', authenticated, async (req, res) => {
    let id = req.query.id
    let doc = await xulydb.docdeviceid(id)
    //console.log(doc)
    return res.render("mainSbAdmin/main_update_devices",{
        _username: req.user.username,
        data: doc,
        activeuser: '',
        activetb: '',
        activetbdp2: '',
        
    })
})
router.post('/update_device', authenticated, async(req, res) => {
    let id = req.body.nameid
    let doc = {
        name: req.body.name,
        location: req.body.location,
        power: req.body.power,
        modem: req.body.modem,
        note: req.body.note,
        username: req.user.username,
    }
    let result = await xulydb.update_device(id,doc)
    res.redirect('/viewdevices1')
})

function authenticated(req, res , next) {
    if(req.isAuthenticated()){
        return next()
    }
    const token = req.headers['authorization']; // Lấy token từ header
  
    if (token) {
      try {
        // Verify token 
        const decoded = jwt.verify(token, secret);  
  
        // Lấy thông tin user từ token
        req.user = decoded.user; 
  
        return next();
  
      } catch (err) {
        // Token không hợp lệ
      }
    }
  
    // Nếu cả Passport và JWT đều không xác thực được
    // thì redirect tới trang đăng nhập
    return res.redirect('/login'); 
}

router.get("/backupmongo",(req, res) => {
    let a = toolmongo.backupMongo("mongodb://127.0.0.1:27017/qlvt", (e, result) => {
        if(e){
            console.error(`Error: ${e.message}`);
            return 'lỗi'
        }else {
            console.log(`Backup and conversion successful. Exported to: ${result}`);
            return 'ok'
        }
    })
    return res.send(a)
})

router.get("/restoremongo", (req, res) => {
    let a = toolmongo.restoremongo("mongodb://127.0.0.1:27017/qlvt")
    res.end()
})
router.get("/danhgiasaotest", (req, res) => {
    return res.render('danhgiasao')
})


router.get('/chuyenexcel', authenticated, async(req, res)=> {
    try {
        // Lấy dữ liệu từ MongoDB
        const documents = await xulydb.docdevices();
    
        // Tạo workbook và worksheet của Excel
        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet('Documents');
    
        // Đặt tên các cột
        worksheet.columns = [
          { header: 'Ten TB', key: 'name', width: 20 },
          { header: 'Vi Tri', key: 'location', width: 20 },
          { header: 'Cong Suat', key: 'power', width: 20 },
          { header: 'Modem', key: 'modem', width: 20 },
          { header: 'Ghichu', key: 'note', width: 20 },
          { header: 'Username', key: 'username', width: 20 },
        ];
    
        // Thêm dữ liệu vào worksheet
        documents.forEach((document) => {
          worksheet.addRow({ 
            name: document.name, 
            location: document.location, 
            power: document.power, 
            modem: document.modem, 
            note: document.note, 
            username: document.username, 
        });
        });
    
        // Tạo file Excel và gửi về client
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=documents.xlsx');
        await workbook.xlsx.write(res);
        res.end();
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
  
})

router.get('/backupdatabase', async (req, res) => {
    await toolmongo.backupMongo(process.env.DATABASE_URL,(callback)=>{
        console.log(callback)
        fs.readFile(callback, (err, data) => {
            if (err) {
              res.writeHead(500, { 'Content-Type': 'text/plain' });
              res.end('Internal Server Error');
            } else {
              // Thiết lập các header cho response
              res.writeHead(200, {
                'Content-Type': 'text/plain',
                'Content-Disposition': 'attachment; filename=backup.gz', // Tên tệp tin khi tải về
              });
        
              // Gửi nội dung của tệp tin
              res.end(data);
            }
        })
    })
    

})

router.get('/mainSbadmin_hethong', authenticated, (req, res) => {
    return res.render("mainSbAdmin/mainSbadmin_hethong",{
        _username: req.user.username,
        activeuser: '',
        activetb: '',
        activetbdp2: '',
        
    })
})

module.exports = router