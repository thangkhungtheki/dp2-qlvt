var express = require("express")
var router = express.Router()
var xulydb = require('../CRUD/xulydb')

const filemulter = require('../multer-upload/multer')
const toolmongo = require('../tool_mongo/backup')
const sendmailpkythuat = require('../sendmail/sendmailpyc')
const sendmailhoanthanh = require('../sendmail/sendmailhoanthanh')

var uridatabase = process.env.DATABASE_URL
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

router.get('/backupdatabase', async (req, res) => {
  await toolmongo.backupMongo(uridatabase, () => {

  })
  return res.send('ok done')
})

router.get('/rootyeucau', ruleroot, async (req, res) => {

  const successMessage = req.flash('success')[0];
  return res.render('rootadmin/main-yeucau', { data: req.user, successMessage })
})

router.get('/', async (req, res) => {
  if (req.isAuthenticated()) {
    let user = await xulydb.timUser(req.user.username)
    // console.log(user)


    switch (user.role) {

      case "root":
        res.redirect('/qlkt/bieudotron')
        break;
      case "admin":
        res.redirect('/qlkt/bieudotron')
        break;
      case "tp":
        // if (user.bp === 'house') {
        //   let doc = await ycsc.docyeucautheotrangthai('dangxuly', user.bp)
        //   return res.render('admin_house/main/dashboard', { data: doc })
        //   break;
        // }
        let doc = await ycsc.docyeucautheotrangthai('dangxuly', user.bp)
        return res.render('layoutkythuat/main/dashboard', { data: doc })
        break;
      case "nv":
        const successMessage = req.flash('success')[0];
        return res.render('layoutkythuat/user/dashboard', { data: user, successMessage })
        break;
      default:
        return res.send('bạn đã Đăng ký thành công!!! <br\> Chào bạn: <b>' + user.username + ' </b>, vui lòng liên hệ admin và báo tên user, để được cấp quyền')
    }



  } else {
    return res.redirect('/signin')
  }

})



router.post('/taoyc', filemulter.upload.array('image', 4), filemulter.handleError, async (req, res) => {
  if (req.isAuthenticated()) {

    // if (req.files.length > 3) {
    //   console.log('hơn 4 file')
    //   req.flash('success', 'Vượt số lượng file, tối đa 3 file ảnh ');
    //   res.redirect('/qlkt')
    // } else {
    try {
      var fileName = req.files
      var ma = req.body.code
      //console.log(fileName)
      const checkbophan = req.body.bophan

      switch (checkbophan) {
        case "khac":
          var ttbp = 'duyet'
          var vitri = 'TP KyThuat'
          break
        default:
          var ttbp = 'dangxuly'
          var vitri = req.body.vitri

      }
      let doc = {
        mayeucau: ma.replace(/\+/g, ' '),
        nguoiyeucau: req.body.nguoiyc,
        ngayyeucau: req.body.ngay,
        bophan: req.body.bophan,
        dienthoai: req.body.dienthoai,
        vitri: vitri,
        khancap: req.body.option,
        mota: req.body.areamota,
        ttbp: ttbp,
        trangthai: 'choduyet',
        filename: fileName
      }
      //console.log(doc)
      let result = await ycsc.taoyc(doc)
      // Lấy thông báo từ req.flash và truyền nó cho template
      if (result == true) {
        req.flash('success', 'Dữ liệu đã được lưu và gửi thành công!');
        return res.redirect('/qlkt')
      } else {
        req.flash('success', 'Chưa lưu, cần nhập đầy đủ thông tin vào !');
        return res.redirect('/qlkt')
      }
      // console.log(fileName)
    } catch (error) {
      console.log(error)
      return res.send('Lỗi không xác định ')
    }

    // }
  } else {
    return res.redirect('/signin')
  }
})

router.post('/updatettbp', authenticated, async (req, res) => {
  //let doc = await ycsc.timyctheoma(req.body.mayeucau)
  let ma = req.body.mayeucau
  //console.log(ma)
  await ycsc.updatetttbp(ma, 'duyet')
  let doc = await ycsc.timyctheoma(ma)
  if(doc){
    sendmailpkythuat.sendmail(doc)
  }
  return res.end()
})

router.post('/deletettbp', authenticated ,async (req, res) => {
  let ma = req.body.mayeucau
  console.log('đã xoá: ' + ma)
  await ycsc.deletettbp(ma)

  return res.end()
})

router.post('/deletephongkythuat', ruleAdmin, async (req, res) => {
  let ma = req.body.mayeucau
  console.log('đã xoá: ' + ma)
  await ycsc._deletephongkythuat(ma)

  return res.send(true)
})

router.get('/xemlichsu', authenticated, async (req, res) => {

  // let user = await xulydb.timUser(req.user.username)
  // console.log(user)
  switch (req.user.role) {
    case "admin":
      return res.redirect('/vattutest')
      break;
    case "tp":
      let doc = await ycsc.docyeucautheotrangthai('duyet', req.user.bp)
      if (req.user.bp == 'house') {
        // const successMessage = req.flash('success')[0]

        return res.render('admin_house/main/viewxemlichsu', { data: doc })
        break;
      } else {
        return res.render('layoutkythuat/main/viewxemlichsu', { data: doc })
        break;
      }

    case "nv":
      const successMessage = req.flash('success')[0];
      return res.render('layoutkythuat/user/dashboard', { data: req.user, successMessage })
      break;
    default:
      return res.send('bạn đã Đăng ký thành công!!! <br\> Chào bạn: <b>' + user.username + ' </b>, vui lòng liên hệ admin và báo tên user, để được cấp quyền')
  }

})

router.get('/viewyeucau', authenticated, (req, res) => {
  // try {
  //   var user = await xulydb.timUser(req.user.username)
  // } catch (error) {
  //   console.log('có lỗi')
  // }

  const successMessage = req.flash('success')[0]
  if (req.user.bp == 'housetat') {
    // const successMessage = req.flash('success')[0]

    return res.render('admin_house/main/view_guiyc', { data: req.user, successMessage })
  } else {
    return res.render('layoutkythuat/main/view_guiyc', { data: req.user, successMessage })
  }

  //const successMessage = req.flash('success')[0]

})

router.get('/info', authenticated, async (req, res) => {

  // var user = await xulydb.timUser(req.user.username)
  let mayeucau = req.query.mayeucau
  //console.log(mayeucau)
  let doc = await ycsc.timyctheoma(mayeucau)
  //console.log(doc)
  //let datafile = doc[0].filename
  //console.log(datafile)
  if (doc) {
    if(req.user.bp == 'house'){
      return res.render('admin_house/main/view_info', { data: doc, user: req.user, myPathENV: process.env.myPathENV })
    }else{
      return res.render('layoutkythuat/main/view_info', { data: doc, user: req.user, myPathENV: process.env.myPathENV })
    }
    
  }


})

router.get('/viewtheobophan_daduyet', ruleAdmin, async (req, res) => {
  let bp = req.query.bophan
  let doc = await ycsc.timyctheobophan(bp)
  if (doc) {
    return res.render('mainSbAdmin/viewsuachuatheophong', { data: doc, _username: '' })
  }
})

// test biểu đồ thống kê
router.get('/bieudotron', ruleAdmin, async (req, res) => {
  let total = await tongsuachuaton()
  return res.render('rootadmin/bangduyetpyc', { _username: req.user.username, total: total },)
})

router.get('/tonghophoanthanh', ruleAdmin, async (req, res) => {
  let doc = await ycsc._doctatcayeucauhoanthanh('hoanthanh')
  if (doc) {
    return res.render('mainSbAdmin/viewsuachuatheophong', { data: doc, _username: '' })
  }
})

router.post('/updatekythuat', filemulter.upload.array('image2', 4), filemulter.handleError, async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      let fileName = req.files
      let ma = req.body.code
      var motacuakythuat = ''
      if(req.body.readonlymotacuakythuat){
        motacuakythuat = req.body.readonlymotacuakythuat + '\n' + req.body.motacuakythuat
        // console.log('>>> có mota readlonly ', motacuakythuat)
      }else{
        motacuakythuat = req.body.motacuakythuat
        // console.log('>>> ko ', motacuakythuat)
      }
      let result = await ycsc.updatekythuat(ma, 'dangxuly', motacuakythuat, fileName)
      res.redirect('/qlkt/info?mayeucau=' + ma)
    } catch (e) {
      return res.send(e)
    }
  } else {
    return res.redirect('/signin')
  }
})

router.post('/updatehoanthanh', async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      let ma = req.body.code
      let trangthai = req.body.trangthai
      let result = await ycsc._updatetrangthai(ma, trangthai)
      let doc = await ycsc.timyctheoma(ma)
      if(doc && trangthai == 'hoanthanh'){
        sendmailhoanthanh.sendmail(doc)
      }
      return res.send(result)
    } catch (error) {

    }
  }
})

router.post('/updatefeedback', authenticated, async (req, res) => {
  try {
    let ma = req.body.mayeucau
    let diem = req.body.diem
    let feedback = req.body.feedback
    let result = await ycsc._updatefeedback(ma, diem, feedback)
    return res.send(result)
  } catch (error) {

  }
})

router.get('/tongsuachuaton', async (req, res) => {
  let total = await tongsuachuaton()
  return res.json({ total: total })
})



function authenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/login');
}

function ruleAdmin(req, res, next) {
  if (req.isAuthenticated() && (req.user.role == 'admin' || req.user.role == 'root')) {
    return next();
  }

  return res.redirect('/signin');
}

function ruleroot(req, res, next) {
  if (req.isAuthenticated()) {
    if (req.user.role == 'root') {
      return next();
    } else {
      return res.redirect('/qlkt/bieudotron')
    }

  }
  return res.redirect('/signin');
}

router.get('/printyeucau',authenticated, async (req, res) => {

  var user = await xulydb.timUser(req.user.username)
  
  let mayeucau = req.query.mayeucau
  //console.log(mayeucau)
  let doc = await ycsc.timyctheoma(mayeucau)
  var tentruongphong = ''
  switch (doc[0].bophan) {
    case "fb":
      tentruongphong = 'Nguyễn Thái Bình'
      break;
    case "bep":
      tentruongphong = 'Phan Bảo Toàn'
      break;
    case "sales":
      tentruongphong = 'Nguyễn Thị Thanh Dung'
      break;
    case "marketing":
      tentruongphong = 'Phạm Anh Tuấn'
      break;
    case "ketoan":
      tentruongphong = 'Phạm Thanh Thuỳ'
      break;
    case "house":
      tentruongphong = 'Phạm Khắc Quy'
      break;
    case "nhansu":  
      tentruongphong = 'Trần Thị Bích Dung'
      break;
    case "baove":
      tentruongphong = 'Nguyễn Hoàng Phương'
      break; 
    case "avtrangtri":
      tentruongphong = 'Trần Ninh Thuận'
      break; 
    default:
      break;
  }
  //console.log(doc)
  //let datafile = doc[0].filename
  //console.log(datafile)
  
  if (doc) {
    let fixmota = doc[0]?.mota?.replace(/\n/g, '<br>')
    let fixmotakythuat = doc[0]?.motakythuat?.replace(/\n/g, '<br>')
    return res.render('docformtoejs/phieuyeucau.ejs', { data: doc, _username: '', user: user, tentruongphong: tentruongphong, mota: fixmota, motakythuat : fixmotakythuat, myPathENV: process.env.myPathENV })
  }


})

module.exports = router