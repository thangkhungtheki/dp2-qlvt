const modemhousetask = require("../model/house.task") // Đây là Mongoose Model

async function docs(query){
    let docs = await modemhousetask.find(query)
    return docs
}


async function create(doc){
    try{
        await modemhousetask.create(doc)
        return true
    }catch(e){
        return false
    }
}

async function updates(id, doc){
    
    try{
        await modemhousetask.findByIdAndUpdate(id, doc)
        return true
    }catch(e){
        return false
    }
}


async function deletes (id){
    try {
        await modemhousetask.findByIdAndDelete(id)
        return true
    } catch (e) {
        return false
    }
}

// Hàm mới: Dùng để cập nhật nhiều document cùng lúc (dùng trong logic đánh dấu check = 'x')
async function update_many(query, update) {
    try {
        // Sử dụng phương thức updateMany của Mongoose Model
        // 'query' là điều kiện lọc ({_id: {$in: [...]}}), 'update' là giá trị cần set ({{$set: {check: 'x'}}})
        const result = await modemhousetask.updateMany(query, update);
        return result; 
    } catch (e) {
        console.error('Lỗi trong hàm update_many của module baotrisuachua:', e);
        throw e; // Ném lỗi để hàm gọi nó (guimailsuachuathang) có thể bắt
    }
}
async function xulyupdate_lichsucv(id, lichsucv){
    try{
        const updated = await modemhousetask.findByIdAndUpdate(
            id,
            { lichsucv: lichsucv }, // Ghi đè lichsu cũ bằng chuỗi mới đã nối
            { new: true } // Trả về document đã được cập nhật
        );
        return updated
    }catch(e){
        return false
    }
}

async function xulyupdate_lichsukiemtra(id, lichsukiemtra){
    try{
        const updated = await modemhousetask.findByIdAndUpdate(
            id,
            { lichsukiemtra: lichsukiemtra }, // Ghi đè lichsu cũ bằng chuỗi mới đã nối
            { new: true } // Trả về document đã được cập nhật
        );
        return updated
    }catch(e){
        return false
    }
}
module.exports = {
    docs,
    create,
    updates,
    deletes,
    xulyupdate_lichsucv,
    update_many, // Bổ sung hàm mới vào danh sách export
    xulyupdate_lichsukiemtra
}