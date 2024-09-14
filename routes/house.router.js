var express = require("express")
var router = express.Router()
var xulyhouse = require('../CRUD/xuly_house')
var moment = require('moment')
var sendmail = require('../sendmail/house.sendmail')
moment.updateLocale('en', null);

router.get('/cvdinhky', authenticated, (req, res) => {
    res.render('admin_house/main/view_cvdinhky')
})

router.get('/themcvdinhky', (req, res) => {

    res.render('admin_house/main/themcongviecdinhky')
})

router.get('/xemcongviecdinhky', async (req, res) => {
  const docs = await xulyhouse.tim()
  res.render('admin_house/main/view_cvdinhky',{data: docs})
})

router
.get('/suacongviecdinhky', async (req, res)=> {
  const id = req.query.id
  //console.log(id)
  const doc = await xulyhouse.timid(id)
  if(doc){
    // doc[0].ngaybatdau = moment(doc[0].ngaybatdau).format('YYYY-MM-DD')
    // doc[0].ngayketthuc = moment(doc[0].ngayketthuc).format('YYYY-MM-DD')
  
    res.render('admin_house/main/sua_cvdinhky',{data: doc })
  }
})
.post('/suacongviecdinhky', async(req, res)=> {
  let originalDate = moment(req.body.ngaybatdau)
  let ngayformat = originalDate.format('YYYY-MM-DD')
  let originNgayketthuc = moment(req.body.ngayketthuc)
  let ngayketthucFormat = originNgayketthuc.format('YYYY-MM-DD')
  //console.log(ngayformat)
  let id = req.body.iddinhky
  let doc = {
    tencv: req.body.tencv,
    vitricv: req.body.vitricv,
    ngaybatdau: ngayformat,
    timehethan: req.body.timehethan,
    ngayketthuc: ngayketthucFormat,
    ngayguimail: req.body.ngayguimail,
    ghichu: req.body.ghichu,
    laplai: req.body.name_checkbox || "no",
    hoanthanh: req.body.hoanthanh
  }
  //console.log(doc)
  const result = await xulyhouse.sua(id, doc)
  if(result){
    return res.redirect('/house/xemcongviecdinhky')
  }else{
    return res.send('Lỗi không update được >>> check lại hệ thống')
  }
})

router.post('/hoanthanhcv', async(req, res)=>{
  let id = req.body.id
  let result = await xulyhouse.updatehoanthanh(id,'yes')
  if(result){
    return res.send('Thành công')
  }else{
    return res.send('Lỗi Hệ Thống vui lòng thử lại sau !!! Xin cảm ơn')
  }
})

router.post('/themhouse', async(req, res) => {
  let  originalDate = moment(req.body.ngaybatdau)
  let ngayformat = originalDate.format('YYYY-MM-DD')
  let originNgayketthuc = moment(req.body.ngayketthuc)
  let ngayketthucFormat = originNgayketthuc.format('YYYY-MM-DD')
  //console.log(ngayketthucFormat)
  //console.log(ngayformat)
  let doc = {
    tencv: req.body.tencv,
    vitricv: req.body.vitricv,
    ngaybatdau: ngayformat,
    timehethan: req.body.timehethan,
    ngayketthuc: ngayketthucFormat,
    ngayguimail: req.body.ngayguimail,
    ghichu: req.body.ghichu,
    laplai: req.body.name_checkbox || "no"
  }
  const result = await xulyhouse.them(doc)
  if(result){
    // return res.send('<script> alert("Thêm thành công !!!") ; window.location.href = "/house/themcvdinhky" </script>')
    return res.redirect('/house/themcvdinhky')
  }else{
    return res.send('có lôĩ không thêm được')
  }
})

router.post('/delcvdinhky', async(req, res) => {
  let id = req.body.id
  // console.log(id)
  const result = await xulyhouse.xoa(id)
  if(result){
    return res.redirect('/house/xemcongviecdinhky')
  }else{
    return res.send('có lỗi không xoá >>> tải lại trang')
  }
})

router.get('/cronjobsendmail', async(req, res) => {
  const docs = await xulyhouse.tim()
  const newdata = await tinhngayconlai(docs)
  sendmail.sendmail(newdata)
  return res.status(200).send('ok');
})

router.get('/cronjobchecklaplai', async(req, res) => {
  const docs = await xulyhouse.tim()
  const newdata = await tinhngayconlai(docs)
  // console.log(newdata)
  var daynow = moment().format('YYYY-MM-DD');
  for (let i = 0 ; i < newdata.length; i++){
    // console.log(">>>songaythehan: ",newdata[i].songayhethan)
    if(newdata[i].songayhethan * 1 <= 0 && newdata[i].laplai == 'yes'){
      // console.log('>>>songayhethan', newdata[i].songayhethan)
      let test2 = newdata[i].songayhethan * 1
      const fixdaynow = moment(daynow).add(test2, 'days')
      let test = newdata[i].timehethan * 1
      //console.log(test)
      const nextDay = moment(fixdaynow).add(test, 'days');
      const fixnextDay = moment(nextDay).format('YYYY-MM-DD')
      const doc = {
        ngaybatdau: moment(fixdaynow).format('YYYY-MM-DD'),
        ngayketthuc: fixnextDay,
        hoanthanh: 'no',
        flagguimail: 'no'
      }
      // console.log(doc)
      let result = await xulyhouse.xulycronjoblaplai(newdata[i]._id, doc)
      if(result){
        // console.log(result)
      }
    }
  }
  return res.send('done!!!')
})

router.get('/cronjobcheckvasuadblaplai', async(req, res) => {
 
  return res.status(200).send('ok');
})

function authenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
  }

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
    // const daynow = new Date();
    // const outputDateFormat = 'YYYY-MM-DD';
    // const fixdaynow = moment(daynow).format(outputDateFormat);
    const daynow = moment().format('YYYY-MM-DD');
    for (let i = 0; i < data.length; i++) {
        let ngayketthuc = moment(data[i].ngayketthuc).format('YYYY-MM-DD')
        let ngaybatdau = moment(data[i].ngaybatdau).format('YYYY-MM-DD')
        let songay = moment(ngayketthuc).diff(daynow, 'days');
        let songayconlaicuangaybatdau = moment(ngaybatdau).diff(daynow, 'days');
        // console.log('>>>tencv', data[i].tencv)
        // console.log(">>>songay: ",songay)
        // console.log(">>>songayconlaicua ngaybatdau: ",songayconlaicuangaybatdau)
        if(songayconlaicuangaybatdau <= data[i].ngayguimail ){
          data[i].flagguimail = "yes"
        }
        //console.log('Data số ngày: ',songay);
        data[i].songayhethan = songay
        newdata.push(data[i])
       }

    return newdata
}

module.exports = router