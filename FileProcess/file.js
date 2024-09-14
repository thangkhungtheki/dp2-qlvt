const fs = require('fs')

function xoafile (duongdan) {
    fs.unlink(duongdan, (err) => {
        if (err) {
          console.error(`Lỗi khi xóa tệp tin: ${err}`);
        } else {
          console.log('Tệp tin đã được xóa thành công');
        }
    })
}

module.exports = {
    xoafile,
}