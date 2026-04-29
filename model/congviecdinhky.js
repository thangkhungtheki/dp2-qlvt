const mongoose = require('mongoose')

const schema = new mongoose.Schema({

  // 🧾 thông tin chính
  tencv: { type: String, required: true },
  vitri: { type: String },
  mo_ta: { type: String },

  // 🔥 loại định kỳ
  loai_dinh_ky: {
    type: String,
    enum: ['tuan', 'thang', 'quy', 'custom'],
    required: true
  },

  // 📅 config lịch
  thu_trong_tuan: [Number],      // [2,4,6]
  ngay_trong_thang: [Number],    // [10,15]
  thang_trong_quy: [Number],     // [1,2]
  lap_lai_moi: Number,           // ví dụ 2 tháng/lần

  // ⏱ thời gian
  so_ngay_thuc_hien: Number,
  so_ngay_nhac_truoc: Number,

  // 👤 quản lý
  phong_ban: String,
  nguoi_phu_trach: String,
  muc_do: {
    type: String,
    enum: ['thap', 'trung_binh', 'cao'],
    default: 'trung_binh'
  },

  // ⚙️ trạng thái
  laplai: { type: Boolean, default: true },
  hoanthanh: { type: Boolean, default: false },
  flagguimail: { type: Boolean, default: false },

  created_at: { type: Date, default: Date.now }

})

module.exports = mongoose.model('congviecdinhky', schema)
