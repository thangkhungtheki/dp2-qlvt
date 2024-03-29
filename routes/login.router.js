var express = require("express")
var router = express.Router()
var passport = require("../config/passport")
var xulydb = require("../CRUD/xulydb")
const jwt = require('jsonwebtoken')
const secret = "taolathangkhungtheki"

router.post('/jwt', passport.authenticate('local.signin'), login)

router.get('/testget', (req, res) => {
    res.json({
        id: 1,
        router: 'api login',
        content: 'abcdefgh'
    })
})

function login(req, res) {
    // Tạo JWT với uid của user
    const userId = req.user.id;
    const token = jwt.sign({ uid: userId }, secret)

    // Trả về cho client
    res.send({
        user: req.user,
        token
    });
}

// router.get('/protected-page', (req, res, next) => {
//     // Lấy token từ header
//     const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
//     if (!token) {
//         return res.status(401).json({ message: 'Unauthorized' });
//     }
//     // Xác thực token
//     jwt.verify(token, secret, (err, decoded) => {
//         if (err) {
//             return res.status(401).json({ message: 'Unauthorized' });
//         }
//         // Nếu token hợp lệ, cho phép truy cập
//         // const userId = req.user.id;
//         // userId = decoded.userId;
//         next();
//     });
// });

router.get('/protected-page', authenticateToken , (req, res) => {
    // Truy cập được trang bảo vệ
    res.json({ message: 'Authorized access' });
});

function authenticateToken(req, res, next) {
    // Lấy header 'Authorization' từ request
    const authHeader = req.headers['authorization'];
    // Kiểm tra xem header 'Authorization' có tồn tại và có đúng định dạng 'Bearer <token>' không
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
        // Nếu không tồn tại token, trả về lỗi 401 (Unauthorized)
        return res.sendStatus(401);
    }

    // Xác thực token bằng cách sử dụng jwt.verify
    jwt.verify(token, secret, (err, user) => {
        if (err) {
            // Nếu xác thực không thành công, trả về lỗi 403 (Forbidden)
            return res.sendStatus(403);
        }
        // Nếu xác thực thành công, gán thông tin người dùng từ token vào request
        req.user = user;
        next(); // Tiếp tục tiến trình xử lý request
    });
}

module.exports = router