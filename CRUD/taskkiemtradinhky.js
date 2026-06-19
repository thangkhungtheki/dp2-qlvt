const taskkiemtradinhky = require("../model/house_cv_dinhky") // Đây là Mongoose Model

async function docs(query){
    let docs = await taskkiemtradinhky.find(query)
    return docs
}


async function creates(doc){
    try{
        await taskkiemtradinhky.create(doc)
        return true
    }catch(e){
        return false
    }
}

async function updates(id, doc){
    
    try{
        await taskkiemtradinhky.findByIdAndUpdate(id, doc)
        return true
    }catch(e){
        return false
    }
}
async function updateoneset(id, nguoiKiemTraMoi) {
    try {
        await taskkiemtradinhky.findByIdAndUpdate(
            id,
            { $set: { nguoikiemtra: nguoiKiemTraMoi } }
        );
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}

async function deletes (id){
    try {
        await taskkiemtradinhky.findByIdAndDelete(id)
    } catch (e) {
        
    }
}

// Hàm mới: Dùng để cập nhật nhiều document cùng lúc (dùng trong logic đánh dấu check = 'x')
async function update_many(query, update) {
    try {
        // Sử dụng phương thức updateMany của Mongoose Model
        // 'query' là điều kiện lọc ({_id: {$in: [...]}}), 'update' là giá trị cần set ({{$set: {check: 'x'}}})
        const result = await taskkiemtradinhky.updateMany(query, update);
        return result; 
    } catch (e) {
        console.error('Lỗi trong hàm update_many của module taskkiemtradinhky:', e);
        throw e; // Ném lỗi để hàm gọi nó (guimailsuachuathang) có thể bắt
    }
}

module.exports = {
    docs,
    creates,
    updates,
    deletes,
    update_many, // Bổ sung hàm mới vào danh sách export
    updateoneset
}