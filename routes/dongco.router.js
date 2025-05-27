var express = require("express")
var router =  express.Router()
var xulydongco = require('../CRUD/db.dongco')
var moment = require('moment')
const exceljs = require('exceljs');
const fs = require('fs')
const ycsc = require('../CRUD/xulyyeucau')
const axios = require('axios');
var xulydbuser = require("../CRUD/xulydb")
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

router.get('/xuatexceldongco', async(req, res) => {
    try {
    let documents = await xulydongco.doc_dongco();

    if (!Array.isArray(documents)) {
      documents = Object.values(documents);
    }

    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('DongcoMayLanh');

    // Định nghĩa các cột và thuộc tính border
    const columns = [
      { header: 'ID', key: 'idthietbi', width: 15 },
      { header: 'Tên Thiết Bị', key: 'tenthietbi', width: 30 },
      { header: 'Loại', key: 'loai', width: 20 },
      { header: 'Ngày Mua', key: 'ngaymua', width: 15 },
      { header: 'Ngày Hết Hạn', key: 'ngayhethan', width: 15 },
      { header: 'Vị Trí', key: 'vitri', width: 25 },
      { header: 'Công Suất', key: 'congsuat', width: 15 },
      { header: 'Model', key: 'model', width: 20 },
      { header: 'Điện Áp', key: 'dienap', width: 15 },
      { header: 'Ghi Chú', key: 'ghichu', width: 30 },
      { header: 'QR Code', key: 'qrcode', width: 20, style: { alignment: { vertical: 'middle', horizontal: 'center' } } },
    ];
    worksheet.columns = columns;

    const qrCodeColumnIndex = 10; // Index cột 'QR Code' (0-based)
    const desiredImageWidth = 80; // Kích thước mong muốn của ảnh trong Excel (pixels)
    const desiredImageHeight = 80;

    for (const [index, document] of documents.entries()) {
      const rowNumber = index + 2;

      worksheet.addRow({
        idthietbi: document.id,
        tenthietbi: document.tenthietbi,
        loai: document.loai,
        ngaymua: document.ngaymua,
        ngayhethan: document.ngayhethan,
        vitri: document.vitri,
        congsuat: document.congsuat,
        model: document.model,
        dienap: document.dienap,
        ghichu: document.ghichu,
        qrcode: '',
      });

      if (document.maqr) {
        try {
          const base64Data = document.maqr.replace(/^data:image\/\w+;base64,/, '');
          const imageBuffer = Buffer.from(base64Data, 'base64');

          const imageId = workbook.addImage({
            buffer: imageBuffer,
            extension: 'png',
          });

          const qrCodeCell = worksheet.getCell(rowNumber, qrCodeColumnIndex + 1);

          const topLeft = { col: qrCodeCell.col - 1, row: qrCodeCell.row - 1 };

          worksheet.addImage(imageId, {
            tl: topLeft,
            ext: { width: desiredImageWidth, height: desiredImageHeight },
            editAs: 'oneCell',
          });

          worksheet.getRow(rowNumber).height = desiredImageHeight * 0.75;
        } catch (error) {
          console.error(`Lỗi xử lý QR code cho ${document.tenthietbi}:`, error);
        }
      } else {
        worksheet.getRow(rowNumber).height = 20;
      }
    }

    // Đóng khung toàn bộ bảng
    const lastRow = documents.length + 1; // Cộng thêm 1 cho hàng header
    const lastColumn = columns.length;

    const range = `A1:${String.fromCharCode(64 + lastColumn)}${lastRow}`;
    const borderStyles = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      row.eachCell((cell, colNumber) => {
        cell.border = borderStyles;
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=dp2.dongcomaylanh.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Lỗi tổng:', error);
    res.status(500).send('Internal Server Error');
  }
})

router.get('/api/capnhatmaqr', async(req, res) => {
    // Lấy dữ liệu từ MongoDB
    const documents = await xulydongco.doc_dongco();
            // Thêm dữ liệu vào worksheet
    documents.forEach(async(document) => {
        let qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + document.id
        try {
            // 1. Tải ảnh từ URL
            if(!document.maqr){
                const response = await axios.get(qrCodeUrl, { responseType: 'arraybuffer' });
                const imageBuffer = response.data;
                var base64Image = Buffer.from(imageBuffer).toString('base64');
            }else{
                var base64Image = document.maqr
            }
            
            const docss = {
                tenthietbi: document.tenthietbi,
                loai: document.loai,
                ngaymua: document.ngaymua,
                ngayhethan: document.ngayhethan,
                vitri: document.vitri,
                congsuat: document.congsuat,
                model: document.model,
                dienap: document.dienap,
                ghichu: document.ghichu,
                maqr: base64Image
            }
            let result = await xulydongco.update_dongco(document.id ,docss)
            console.log(base64Image)
        }catch(e){
            console.log("Loi: ", document.id)
        }
    });
    res.send('make by thang khung the ki')
})

router.get('/dongcoapi', async(req, res) => {
  let id = req.query.id 
  let result = await xulydongco.timdongcotheoID(id)
  res.json(result)
})

router.get('/updatedongco/app', async(req, res) => {
  let id = req.query.id
  let ghichu = req.query.ghichu
  let result = await xulydongco.update_dongco_ghichu(id, ghichu)
  if(result){
    res.send('ok')
  }else{
    res.send('not')
  }
})

router.get('/checkuser', async (req, res) => {
  let email = req.query.email
  let result = await xulydbuser.docUseremail(email)
  if(result){
    res.json({
      ten: result.ten,
      congty: result.congty,
      phong: result.bp,
      email: result.mail
    })
  }else{
    try{
      let respons =  await axios.get('http://file.diamondplace.vn:6868/dongco/checkuser?email=' + email)
      if(respons.data){
        res.json({
          ten: result.ten,
          congty: result.congty,
          phong: result.bp,
          email: result.mail
        })
      }else{
        res.send(false)
      }
    }catch(r){
      res.send('loi server dp1')
    }
  }
})

module.exports = router