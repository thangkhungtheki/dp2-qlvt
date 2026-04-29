const express = require('express')
const router = express.Router()
const Model = require('../model/congviecdinhky')

// ================= LIST =================
router.get('/', async (req, res) => {
  try {
    const { loai } = req.query

    let filter = {}
    if (loai) filter.loai_dinh_ky = loai

    const data = await Model.find(filter).sort({ createdAt: -1 })

    res.render('cv', { data, loai })
  } catch (err) {
    console.log(err)
    res.status(500).send('Lỗi server')
  }
})


// ================= CREATE =================
router.post('/create', async (req, res) => {
  try {
    const body = req.body

    // 🔥 normalize data
    const newData = {
      tencv: body.tencv,
      vitri: body.vitri,
      loai_dinh_ky: body.loai_dinh_ky,

      thu_trong_tuan: body.thu_trong_tuan || [],
      ngay_trong_thang: body.ngay_trong_thang || [],
      thang_trong_quy: body.thang_trong_quy || [],

      so_ngay_thuc_hien: body.so_ngay_thuc_hien || 1,
      so_ngay_nhac_truoc: body.so_ngay_nhac_truoc || 1,

      phong_ban: body.phong_ban || 'house'
    }

    await Model.create(newData)

    res.redirect('/cv')
  } catch (err) {
    console.log(err)
    res.status(500).send('Lỗi create')
  }
})


// ================= UPDATE =================
router.post('/update/:id', async (req, res) => {
  try {
    await Model.findByIdAndUpdate(req.params.id, req.body)
    res.redirect('/cv')
  } catch (err) {
    console.log(err)
    res.status(500).send('Lỗi update')
  }
})


// ================= DELETE =================
router.post('/delete/:id', async (req, res) => {
  try {
    await Model.findByIdAndDelete(req.params.id)
    res.redirect('/cv')
  } catch (err) {
    console.log(err)
    res.status(500).send('Lỗi delete')
  }
})


// ================= TEST CRON =================
router.get('/test-cron', async (req, res) => {
  try {
    const generateDaily = require('../cron/generateDaily')
    const sendReminder = require('../cron/sendReminder')

    await generateDaily()
    await sendReminder()

    res.send('✅ Đã chạy cron test')
  } catch (err) {
    console.log(err)
    res.status(500).send('Lỗi test cron')
  }
})

module.exports = router
