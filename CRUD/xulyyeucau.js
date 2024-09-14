const _ycsc = require('../model/yeucausuachua.model')
const _file = require('../FileProcess/file')
//const _path = 'DP1-VATTU/DP1-Ver.Conect-DB-Node-login-use-schema/multer-upload/uploads/'
async function taoyc(doc){
    try{
        await _ycsc.create(doc)
        return true
    }catch(e){
        return false
    }
}

async function docyeucautheotrangthai(trangthai, bophan){
    try{
        let doc = await _ycsc.find({ttbp: trangthai, bophan: bophan})
        return doc
    }catch(e){
        return false
    }
}

async function timyctheoma(ma){
    try{
        let doc = await _ycsc.find({mayeucau: ma})
        return doc
    }catch(e){
        return false
    }
}

async function timyctheobophan(bp){
    try{
        let doc = await _ycsc.find({
            bophan: bp , 
            ttbp: 'duyet', 
            $or: [
                { trangthai: { $ne: 'hoanthanh' } }]
            })
        return doc
    }catch(e){
        return false
    }
}

async function timtatca_yctheobophan(bp){
    try{
        let doc = await _ycsc.find({
            bophan: bp , 
            // ttbp: 'duyet', 
            // $or: [
            //     { trangthai: { $ne: 'hoanthanh' } }]
            })
        return doc
    }catch(e){
        return false
    }
}


async function updatetttbp(mayeucau, ttbp){
    try {
        await _ycsc.updateOne({mayeucau: mayeucau}, {$set:{ttbp: ttbp}})
    } catch (e) {
        console.log(e)
        return false
    }
}

async function deletettbp (ma) {
    try {
        let doc = await timyctheoma(ma)
        if(doc){
            doc[0].filename.forEach(file => {
                _file.xoafile(file.path)
            })
            await _ycsc.deleteOne({mayeucau: ma})

        }
        
    } catch (e) {
        console.log(e)
        return false
    }
}

async function updatekythuat (mayeucau, trangthai, motakythuat, fileanhdonhang){
    const options = {
        upsert: true, // Nếu không tìm thấy, thêm mới
        new: true,    // Trả về bản ghi sau khi cập nhật (mặc định là trả về bản ghi trước khi cập nhật)
      };
      //console.log(fileanhdonhang)
      const update = {
        $push: {
          fileanhdonhang : {
            $each: fileanhdonhang
        }
         
        },
        $set: {
          trangthai : trangthai,
          motakythuat: motakythuat
          // Thêm các trường cần cập nhật khác ngoài mảng filename
        }
      };
    try {
        await _ycsc.updateOne({mayeucau: mayeucau}, update, options)
    } catch (error) {
        console.log(e)
        return false
    }
}

async function _updatetrangthai(mayeucau, trangthai){
    try {
        await _ycsc.updateOne({mayeucau: mayeucau}, {$set:{trangthai: trangthai}})
        return true
    } catch (e) {
        console.log(e)
        return false
    }
}

async function _doctatcayeucauhoanthanh(trangthai){
    try{
        let doc = await _ycsc.find({
            trangthai: trangthai
            })
        return doc
    }catch(e){
        return false
    }
}

async function _deletephongkythuat(ma){
    try {
        let doc = await timyctheoma(ma)
        if(doc){
            doc[0].filename.forEach(file => {
                _file.xoafile(file.path)
            })
            doc[0].fileanhdonhang.forEach(file => {
                _file.xoafile(file.path)
            })
            await _ycsc.deleteOne({mayeucau: ma})

        }
        return true
    } catch (e) {
        console.log(e)
        return false
    }
}

async function _updatefeedback(mayeucau, diem, feedback){
    try {
        await _ycsc.updateOne({mayeucau: mayeucau}, {$set:{diem: diem, feedback: feedback}})
        return true
    } catch (e) {
        //console.log(e)
        return false
    }
}

module.exports = {
    taoyc,
    docyeucautheotrangthai,
    updatetttbp,
    timyctheoma,
    deletettbp,
    timyctheobophan,
    updatekythuat,
    _updatetrangthai,
    _doctatcayeucauhoanthanh,
    _deletephongkythuat,
    _updatefeedback,
    timtatca_yctheobophan
}