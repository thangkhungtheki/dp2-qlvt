
const multer = require('multer');
const path = require('path');

// Thiết lập thư mục để lưu trữ file ảnh tải lên
const uploadDir = path.join(__dirname, 'uploads');
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    // cb(null, `${Date.now()}-${sanitizeFilename(file.originalname)}`);
    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
    const formattedTime = `${currentDate.getHours().toString().padStart(2, '0')}-${currentDate.getMinutes().toString().padStart(2, '0')}-${currentDate.getSeconds().toString().padStart(2, '0')}`;

    const sanitizedFilename = sanitizeFilename(file.originalname);
    const finalFilename = `${formattedDate}-${formattedTime}-${sanitizedFilename}`;

    cb(null, finalFilename);
  },
});
// Khởi tạo middleware multer với cài đặt storage
const upload = multer({ storage: storage });


// 'image' là tên trường trong form HTML để tải lên, bạn cần đảm bảo nó khớp
// Hàm để làm sạch tên file
function sanitizeFilename(filename) {
  // Thực hiện xử lý nếu cần thiết, ví dụ: thay thế các ký tự không hợp lệ
  return filename.replace(/[^\w.-]/g, '');
}
const handleError = (err, req, res, next) => {
  if(err){
    console.log(req.files.length)
    
    return res.status(500).json({ error: 'Lỗi server. File đã vượt quá số lượng cho phép ' });
    
  }else{
    next()
  }
   
  
};
module.exports = {
  upload,
  handleError
}