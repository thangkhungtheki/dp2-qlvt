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

// path database
mongoose.connect(process.env.DATABASE_URL,{useNewUrlParser:true, useUnifiedTopology: true ,},);
// mongoose.set('strictQuery', false)

// const mongooseOptions = {
//   // ...
//   useUnifiedTopology: true,
//   useNewUrlParser:true
//   // ...
// };

// mongoose.connect(process.env.DATABASE_URL, mongooseOptions);


require('./config/passport'); //vượt qua passport để config trang đăng nhâp/đăng ký

// app.use(cors())

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

app.use('/', indexRouter);

app.use('/api/login/', routerLogin)


// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });
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
  
  next();

});


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