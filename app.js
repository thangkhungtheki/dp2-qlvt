require('dotenv').config()
const cors = require('cors');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
const jwt = require('jsonwebtoken'); // [FIXED] Bổ sung thư viện JWT

var app = express();

// =====================================
// 1. IMPORT CÁC ROUTER
// =====================================
var indexRouter = require('./routes/user.route');
const routerLogin = require('./routes/login.router');
const routercheckip = require('./routes/checkip.router');
const routerdongco = require('./routes/dongco.router');
const routerhopdong = require('./routes/hopdong.router');
var qltkRouter = require('./routes/qlkt.router');
var userktRouter = require('./routes/user.kt');
var houseRouter = require('./routes/house.router');
var houseTaskRouter = require('./routes/housetaskrou');
const baoveRoutes = require('./routes/baove'); // Mang router bảo vệ xuống chung cho đồng bộ
const ycsc = require('./CRUD/xulyyeucau');

// =====================================
// 2. KẾT NỐI DATABASE & CẤU HÌNH CƠ BẢN
// =====================================
mongoose.connect(process.env.DATABASE_URL);

require('./config/passport'); // Vượt qua passport config

app.use(cors());
app.use(cors({ origin: ['https://h5.zdn.vn', 'zbrowser://h5.zdn.vn'] }));

// [FIXED QUAN TRỌNG] Body Parser PHẢI nằm trên các Router để đọc được ảnh Base64 50MB
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// View engine setup & Static files
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'multer-upload/uploads')));
app.use(cookieParser());

// Cấu hình Session & Passport
app.use(session({
    secret: 'thangkhungtheki',
    resave: false,
    saveUninitialized: false,
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// =====================================
// 3. MIDDLEWARE XỬ LÝ CHUNG (IP, JWT, TỔNG)
// =====================================
app.use((req, res, next) => {
    req.clientIP = req.ip;
    req.useragent = req.get('User-Agent');
    next();
});

app.use(async (req, res, next) => {
    try {
        // [FIXED] Chỉ check Token nếu client có gửi kèm Header (Dành cho API Mobile/Frontend)
        // Nếu dùng trình duyệt truy cập EJS thì bỏ qua không bị lỗi crash app
        if (req.headers && req.headers['authorization']) {
            const token = req.headers['authorization'].split(' ')[1];
            const decoded = jwt.verify(token, 'taolathangkhungtheki');
            req.user = req.user || {}; // Đảm bảo object user tồn tại
            req.user.userId = decoded.uid; 
        }

        // Lấy dữ liệu global đưa ra Views EJS
        let total = await tongsuachuaton();
        res.locals.arrayTong = total;
        next();
    } catch (error) {
        console.error("JWT/Middleware Error:", error.message);
        next(); // Vẫn gọi next() để trình duyệt tiếp tục load trang thay vì bị treo trắng
    }
});

// =====================================
// 4. KHAI BÁO CÁC ROUTERS
// =====================================
app.use('/', indexRouter);
app.use('/api/login/', routerLogin);
app.use('/ip', routercheckip);
app.use('/dongco/', routerdongco);
app.use('/hopdong/', routerhopdong);
app.use('/qlkt/', qltkRouter);
app.use('/user/', userktRouter);
app.use('/house/', houseRouter);
app.use('/housetask/', houseTaskRouter);
app.use('/api/dp3/baove', baoveRoutes); // [FIXED] Đặt ở đây mới đọc được Payload ảnh!

// =====================================
// 5. MIDDLEWARE BẮT LỖI CUỐI CÙNG (404)
// =====================================
// [FIXED] Đã chuyển xuống tận cùng. Chỉ những link không có ở trên mới bị đẩy về signin
app.use((req, res, next) => {
    res.status(404).redirect("/signin");
});


// =====================================
// HÀM BỔ TRỢ
// =====================================
async function tongsuachuaton() {
    let bep = await ycsc.timyctheobophan('bep');
    let sales = await ycsc.timyctheobophan('sales');
    let mar = await ycsc.timyctheobophan('marketing');
    let fb = await ycsc.timyctheobophan('fb');
    let ketoan = await ycsc.timyctheobophan('ketoan');
    let av = await ycsc.timyctheobophan('avtrangtri');
    let house = await ycsc.timyctheobophan('house');
    let nhansu = await ycsc.timyctheobophan('nhansu');
    let baove = await ycsc.timyctheobophan('baove');
    let khac = await ycsc.timyctheobophan('khac');
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
    return total;
}

module.exports = app;