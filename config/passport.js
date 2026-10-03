// config/passport.js
var passport = require("passport");
// Lưu ý: Sửa thành 'model' (không có s) theo đúng chuẩn anh em mình vừa thống nhất
var User = require("../model/user.model"); 
var LocalStrategy = require("passport-local").Strategy;

// passport session setup
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(async function (id, done) {
  try {
    // Dùng await thay cho callback cũ
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// =========================================================================
// LOCAL SIGN-UP (ĐĂNG KÝ)
// =========================================================================
passport.use(
  "local.signup",
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
      passReqToCallback: true, 
    },
    async function (req, username, password, done) {
      try {
        // Tìm user bằng await
        const user = await User.findOne({ username: username });
        
        if (user) {
          return done(null, false, { message: "username is already in use." });
        }
        
        var newUser = new User();
        newUser.username = username;
        newUser.password = newUser.enscryptPassword(password); // Giữ nguyên tên hàm mã hóa của anh
        
        await newUser.save();
        return done(null, newUser);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// =========================================================================
// LOCAL SIGN-IN (ĐĂNG NHẬP)
// =========================================================================
passport.use(
  'local.signin',
  new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true
    },
    async function(req, username, password, done) {
      try {
        const user = await User.findOne({ username: username });
        
        if (!user) {
          return done(null, false, { message: 'Not user found' });
        }
        
        if (!user.validPassword(password, user.password)) {
          return done(null, false, { message: 'Wrong password' });
        }
        
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

module.exports = passport;