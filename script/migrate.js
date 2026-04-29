require('dotenv').config()
const mongoose = require('mongoose')
const OldModel = require('../model/house.model.js')
const NewModel = require('../model/congviecdinhky')

// ================= DETECT LOẠI =================
function detectLoai(text = '') {
  text = text.toLowerCase()

  if (text.includes('thứ')) return 'tuan'
  if (text.includes('tháng')) return 'thang'
  if (text.includes('2 tháng') || text.includes('3 tháng')) return 'quy'

  return 'custom'
}

// ================= PARSE THỨ =================
function parseThu(text = '') {
  text = text.toLowerCase()

  const map = {
    'hai': 2,
    'ba': 3,
    'tư': 4,
    'nam': 5,
    'năm': 5,
    'sáu': 6,
    'bay': 7,
    'bảy': 7,
    'cn': 0,
    'chủ nhật': 0
  }

  let arr = []

  Object.keys(map).forEach(k => {
    if (text.includes(k)) arr.push(map[k])
  })

  return [...new Set(arr)]
}

// ================= PARSE NGÀY =================
function parseNgay(text = '') {
  let match = text.match(/(\d+)\s*-\s*(\d+)/)

  if (!match) return []

  let start = parseInt(match[1])
  let end = parseInt(match[2])

  let arr = []
  for (let i = start; i <= end; i++) arr.push(i)

  return arr
}
function toNumber(val, defaultVal = 1) {
  if (!val) return defaultVal

  let num = parseInt(val.toString().replace(/\D/g, ''))

  return isNaN(num) ? defaultVal : num
}

// ================= MAIN =================
async function run() {
  try {
    // path database 
    mongoose.connect(process.env.DATABASE_URL);

    const list = await OldModel.find()

    console.log('Tổng record:', list.length)

    for (let item of list) {

      // 🔥 fix field vitri/vitricv
      let vitriText = item.vitricv || item.vitri || ''

      let loai = detectLoai(vitriText)

      let data = {
        tencv: item.tencv || '',
        vitri: vitriText,
        khuvuc: item.khuvuc || '',

        loai_dinh_ky: loai,

        // 🔥 convert number
    so_ngay_thuc_hien: toNumber(item.thoigian, 1),
    so_ngay_nhac_truoc: toNumber(item.songaynhacthongbao, 1),


        laplai: item.congviectheothang === 'yes',
      }

      // ================= TUẦN =================
      if (loai === 'tuan') {
        data.thu_trong_tuan = parseThu(vitriText)
      }

      // ================= THÁNG =================
      if (loai === 'thang') {
        data.ngay_trong_thang = parseNgay(vitriText)
      }

      // ================= QUÝ =================
      if (loai === 'quy') {
        data.thang_trong_quy = [1,4,7,10] // default
      }

      await NewModel.create(data)
    }

    console.log('✅ MIGRATE DONE')
    process.exit()

  } catch (err) {
    console.log('❌ MIGRATE ERROR:', err)
  }
}

run()
