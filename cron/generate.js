const Model = require('../model/congviecdinhky')

async function run() {

  const today = new Date()
  const thu = today.getDay() || 7
  const ngay = today.getDate()
  const thang = today.getMonth() + 1
  const thangTrongQuy = ((thang - 1) % 3) + 1

  const list = await Model.find({ laplai: true })

  let result = []

  for (let cv of list) {

    let match = false

    if (cv.loai_dinh_ky === 'tuan' && cv.thu_trong_tuan.includes(thu)) {
      match = true
    }

    if (cv.loai_dinh_ky === 'thang' && cv.ngay_trong_thang.includes(ngay)) {
      match = true
    }

    if (cv.loai_dinh_ky === 'quy' && cv.thang_trong_quy.includes(thangTrongQuy)) {
      match = true
    }

    if (match) result.push(cv)
  }

  return result
}

module.exports = run
