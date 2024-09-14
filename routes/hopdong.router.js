var express = require("express")
var router =  express.Router()
var xulyhopdong = require('../CRUD/db.hopdong')
var moment = require('moment')
const exceljs = require('exceljs');

const sendmailhopdong = require('../sendmail/sendmailhopdong')
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
  let mar = await ycsc.timyctheobophan('marketing')
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
    mar: mar.length,
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

router.get('/cronjobsendmailhopdong',async(req, res) => {
    // let daynow = moment().format('DD-MM-YYYY');
    var data =  await xulyhopdong.doc_hopdong()
    var newdata = await tinhngayconlai(data)
    sendmailhopdong.sendmail(newdata)
    res.status(200).send('ok');

})

router.get('/getdataidhopdong', async(req,res) => {
    let id = req.query.id
    // console.log(id)
    let doc = await xulyhopdong.timhopdongtheoID(id)
    // console.log(doc)
    if(doc){
        
        return res.json(doc)
    }else{
        return res.send('none')
    }
})

router.get('/theodoihopdong', async(req, res) => {
    const daynow = moment().format('DD-MM-YYYY');
    const data = await xulyhopdong.doc_hopdong()
    const newdata = await tinhngayconlai(data)
    res.render('mainSbAdmin/mainSbadmin_hopdong',{
        _username : '',
        daynow: daynow,
        data: newdata
    })
})

router.post('/xoahopdong', async(req, res) => {
    let id = req.body.id
    if(id){
        await xulyhopdong.delete_hopdong(id)
    }
    return res.end()
})

router.post('/suahopdong', async(req, res) => {
    let id = req.body.id
    let originalDate = moment(req.body.ngaybatdau)
    let ngayformat = originalDate.format('YYYY-MM-DD')
    let originNgayketthuc = moment(req.body.ngayketthuc)
    let ngayketthucFormat = originNgayketthuc.format('YYYY-MM-DD')
    let sothang = req.body.sothang
    let doc  = {
        tenhopdong: req.body.tenhopdong,
        ngaybatdau: ngayformat,
        ngayketthuc: ngayketthucFormat,
        sothang: sothang,
        ghichu: req.body.ghichu
    }
    // console.log(doc)
    let result = await xulyhopdong.update_hopdong(id, doc)
    if(result){
        return res.send('thanhcong')
    }else{
        return res.send('error')
    }

})

router.post('/themhopdong', async(req, res) => {
    let originalDate = moment(req.body.ngaybatdau)
    let ngayformat = originalDate.format('YYYY-MM-DD')
    let originNgayketthuc = moment(req.body.ngayketthuc)
    let ngayketthucFormat = originNgayketthuc.format('YYYY-MM-DD')
    let sothang = req.body.sothang
    let doc = {
        tenhopdong: req.body.tenhopdong,
        ngaybatdau: ngayformat,
        ngayketthuc: ngayketthucFormat,
        sothang: sothang,
        ghichu: req.body.ghichu,
    }
    //console.log(doc)
    const result = await xulyhopdong.tao_hopdong(doc)
    if(result){
    // return res.send('<script> alert("Thêm thành công !!!") ; window.location.href = "/house/themcvdinhky" </script>')
        return res.end()
    }else{
     return res.send('có lôĩ không thêm được')
    }
})

router.get('/xuatexcelhopdong', async(req, res) => {
    try {
        // Lấy dữ liệu từ MongoDB
        const documents = await xulyhopdong.doc_hopdong();
    
        // Tạo workbook và worksheet của Excel
        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet('TheoDoiHopDong');
    
        // Đặt tên các cột
        worksheet.columns = [
          { header: 'Ten Hop Dong', key: 'tenhopdong', width: 20 },
       
          { header: 'Ngay Bat Dau', key: 'ngaybatdau', width: 20 },
          { header: 'So Thang', key: 'sothang', width: 20 },
          { header: 'Ngay Ket Thuc', key: 'ngayketthuc', width: 20 },
          { header: 'Ghi Chu', key: 'ghichu', width: 20 },
        
        ];
    
        // Thêm dữ liệu vào worksheet
        documents.forEach((document) => {
          worksheet.addRow({ 
            tenhopdong: document.tenhopdong, 
            ngaybatdau: document.ngaybatdau, 
            sothang: document.sothang,
            ngayketthuc: document.ngayketthuc, 
            ghichu: document.ghichu, 
            
        });
        });
    
        // Tạo file Excel và gửi về client
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Theodoihopdong.xlsx');
        await workbook.xlsx.write(res);
        res.end();
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
})

async function tinhngayconlai(data){
    var newdata = []
    const daynow = moment().format('YYYY-MM-DD');
    for (let i = 0; i < data.length; i++) {
        let ngayketthuc = moment(data[i].ngayketthuc).format('YYYY-MM-DD')
       
        let songay = moment(ngayketthuc).diff(daynow, 'days');
        
        
        data[i].songayhethan = songay
        newdata.push(data[i])
       }

    return newdata
}



module.exports = router