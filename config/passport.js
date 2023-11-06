// config/passport.js
// load các module
var passport = require("passport");
// load user model
var User = require("../model/user.model");
var LocalStrategy = require("passport-local").Strategy;
// passport session setup
// used to serialize the user for the session
passport.serializeUser(function (user, done) {
  done(null, user.id);
});
// used to deserialize the user
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});
// local sign-up
passport.use(
  "local.signup",
  new LocalStrategy(
    {
      // mặc định local strategy sử dụng username và password
      //chúng ta có thể cấu hình lại
      usernameField: "username",
      passwordField: "password",
      passReqToCallback: true, // cho phép chúng ta gửi reqest lại hàm callback
    },
    function (req, username, password, done) {
      // Tìm một user theo username
      // chúng ta kiểm tra xem user đã tồn tại hay không
      User.findOne({ username: username }, function (err, user) {
        if (err) {
          return done(err);
        }
        if (user) {
          return done(null, false, { message: "username is already in use." });
        }
        // Nếu chưa user nào sử dụng username này
        // tạo mới user
        var newUser = new User();
        // lưu thông tin cho tài khoản local
        newUser.username = username;
        newUser.password = newUser.enscryptPassword(password);
        // lưu user
        newUser.save(function (err, result) {
          if (err) {
            return done(err);
          }
          return done(null, newUser);
        });
      });
    }
  )
);

passport.use('local.signin',new LocalStrategy({
    usernameField:'username',
    passwordField:'password',
    passReqToCallback:true
 },function(req, username, password,done) {
   
  User.findOne({ 'username': username }, function(err, user) {
        //console.log(user)
        if (err) { return done(err); }
        if (!user) {
          return done(null, false, { message : 'Not user found'})
        }
        if(!user.validPassword(password, user.password)){
       
            return done(null,false,{message:'Wrong password'})
        }
         return done(null, user);
     
      }).clone;
    }
  ));

module.exports = passport