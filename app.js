require('dotenv').config()
const cors = require('cors');

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session')
//var logger = require('morgan');
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var app = express();
var indexRouter = require('./routes/user.route');

const routerLogin = require('./routes/login.router')

const routercheckip = require('./routes/checkip.router')

const routerdongco = require('./routes/dongco.router')

const routerhopdong = require('./routes/hopdong.router')
var qltkRouter = require('./routes/qlkt.router')
var userktRouter = require('./routes/user.kt')
// dùng router house
var houseRouter = require('./routes/house.router')

const ycsc = require('./CRUD/xulyyeucau')
// path database 
mongoose.connect(process.env.DATABASE_URL);
// mongoose.set('strictQuery', false)

// const mongooseOptions = {
//   // ...
//   useUnifiedTopology: true,
//   useNewUrlParser:true
//   // ...
// };

// mongoose.connect(process.env.DATABASE_URL, mongooseOptions);


require('./config/passport'); //vượt qua passport để config trang đăng nhâp/đăng ký

app.use(cors())

app.use(cors({
  origin: ['https://h5.zdn.vn', 'zbrowser://h5.zdn.vn']
  }));

app.use(session({
  secret: 'thangkhungtheki',
  resave: false,
  saveUninitialized: false,
}))
app.use(flash());
app.use(passport.initialize())
app.use(passport.session());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'multer-upload/uploads')));
app.use('/', indexRouter);

app.use('/api/login/', routerLogin)

app.use('/ip',routercheckip )

app.use('/dongco/', routerdongco)

app.use('/hopdong/', routerhopdong)

app.use('/qlkt/', qltkRouter);
app.use('/user/' ,userktRouter )
app.use('/house/', houseRouter)

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });
// Middleware để lấy địa chỉ IP và user-agent
app.use((req, res, next) => {
  // Lấy địa chỉ IP của client
  const ip = req.ip;

  // Lấy user-agent của client
  const userAgent = req.get('User-Agent');

  // Gán vào req để truy cập từ các route hoặc view
  req.clientIP = ip;
  req.useragent = userAgent;

  // Tiếp tục xử lý các middleware hoặc route khác
  next();
});

app.use((req, res, next) => {
	res.status(404).redirect("/signin");
});

app.use(async (req, res, next) => {

  const token = req.headers['authorization'].split(' ')[1];

  // Verify JWT
  const decoded = jwt.verify(token, 'taolathangkhungtheki');

  // Lấy thông tin user ID
  const userId = decoded.uid; 

  // Lưu userId vào req
  req.user.userId = userId;
  let total = await tongsuachuaton()
  res.locals.arrayTong = total
  next();

});

// Middleware để thiết lập dữ liệu trong res.locals
// app.use(async (req, res, next) => {
//   let total = await tongsuachuaton()
//   res.locals.arrayTong = total
//   next();
// });

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
// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

// app.listen(process.env.PORT || 3000,()=>{
//     console.log("App chay port 3000")
// })

module.exports = app;