
//const mongoose = require("mongoose")
const _user = require("../model/user.model")
const _thietbi = require("../model/tb.model")
const _thietbidp2 = require("../model/tb.model.dp2")
const _vattu = require("../model/vattu.model")
const _nhapvattu = require("../model/nhapvattu.model")
const _xuatvattu = require("../model/xuatvattu.model")
const _createthietbi = require("../model/createthietbi.model")
const _device = require('../model/device')
//mongoose.connect("mongodb+srv://tkbot:Iqzg8qpVDNMUxTLm@cluster0.zl0wy.mongodb.net/test",{useNewUrlParser:true, useUnifiedTopology: true })
async function docUser(){
    let docs = await _user.find()
    return docs
}

async function doc_createthietbi(){
    let docs = await _createthietbi.find()
    return docs
}

async function them_createthietbi(doc){
    //console.log(doc)
    try{
        await _createthietbi.create(doc)
        return true
    }catch(e){
        return false
    }
}

async function xoa_createthietbi(tentb){
    try {
        await _createthietbi.deleteOne({tentb: tentb})
        return true
    } catch (error) {
        return error
    }
    
    
}

async function sua_createthietbi(tentbb, doc){
    try{
        await _createthietbi.updateOne({tentb: tentbb}, doc)
        
        return true
    }catch(e){
        console.log(false)
        return false
    }
}

async function tim_createthietbi(tentbb){
    let doc = await _createthietbi.findOne({tentb: tentbb})
    //console.log(doc)
    if(doc){
        //console.log(doc)
        return doc
    } 
    else {
        return false
    }
}

async function find(users){
    let doc = await _user.findOne({username: users})
    
    if(doc.role == 'admin'){
        //console.log(doc)
        return true
    } 
    else {
        return false
    }
}



async function docTb(){
    let docs = await _thietbi.find()
    return docs
}

async function docTbdp2(){
    let docs = await _thietbidp2.find()
    return docs
}

async function timTb(ab){
    let docs = await _thietbi.findOne({Ma: ab})
    return docs
}

async function timTbdp2(ab){
    let docs = await _thietbidp2.findOne({Ma: ab})
    return docs
}

async function xoaTb(_tb){
    try {
        await _thietbi.deleteOne({Ma: _tb})
        return true
    } catch (error) {
        return error
    }
    
    
}

async function xoaTbdp2(_tb){
    try {
        await _thietbidp2.deleteOne({Ma: _tb})
        return true
    } catch (error) {
        return error
    }
    
    
}

async function updatetb(ma, doc){
    try{
        await _thietbi.updateOne({Ma: ma},doc)
        return true
    }catch(e){
        return false
    }
}

async function updatetbdp2(ma, doc){
    try{
        await _thietbidp2.updateOne({Ma: ma},doc)
        return true
    }catch(e){
        return false
    }
}

async function themtb(doc){
    //console.log(doc)
    try{
        await _thietbi.create(doc)
        return true
    }catch(e){
        return false
    }
}

async function themtbdp2(doc){
    //console.log(doc)
    try{
        await _thietbidp2.create(doc)
        return true
    }catch(e){
        return false
    }
}

async function timvattu(loai){
    let docs = await _vattu.find({Loaivattu: loai})
    return docs
}

async function luunhapvattu(doc){
    //console.log(doc)
    try{
        await _nhapvattu.create(doc)
        return true
    }catch(e){
        return false
    }
}

async function luuxuatvattu(doc){
    //console.log(doc)
    try{
        await _xuatvattu.create(doc)
        return true
    }catch(e){
        return false
    }
}

async function luumavattu(doc){
    //console.log(doc)
    try{
        await _vattu.create(doc)
        return true
    }catch(e){
        return false
    }
}

async function timnhap(mavattu){
    let docs = await _nhapvattu.find({Ma_vattu: mavattu})
    //console.log(docs)
    var soluong = 0;
    docs.forEach(element => {
        let a = Number(element.soluong)
        soluong += a
    });
    return soluong
}

async function timxuat(mavattu){
    let docs = await _xuatvattu.find({Ma_vattu: mavattu})
    var soluongnhap = 0;
    docs.forEach(element => {
        let a = Number(element.soluong)
        soluongnhap += a
    });
    return soluongnhap
}

async function timton(mavattu){
    let slnhap = await timnhap(mavattu)
    let slxuat = await timxuat(mavattu)
    let slton = slnhap - slxuat

    return slton
}

async function docvattu(){
    let docs = await _vattu.find()
    return docs
}

async function docnhap(){
    let docs = await _nhapvattu.find()
    return docs
}

async function docxuat(){
    let docs = await _xuatvattu.find()
    return docs
}

async function baocaovattu(){
    let __vattu = await docvattu()
    var __data = []

    await Promise.all(__vattu.map(async (element) => {
        let __slnhap = await timnhap(element.Ma_vattu)
        let __slxuat = await timxuat(element.Ma_vattu)
        let __slton = __slnhap - __slxuat
        let data = {
            loai: element.Loaivattu,
            mavattu: element.Ma_vattu,
            tenvattu: element.Tenvattu,
            nhap: __slnhap,
            xuat: __slxuat,
            ton: __slton,
        }
        //console.log(data)
        __data.push(data)
    }))
    // __vattu.forEach(async element => {
    //     let __slnhap = await timnhap(element.Ma_vattu)
    //     let __slxuat = await timxuat(element.Ma_vattu)
    //     let __slton = __slnhap - __slxuat
    //     let data = {
    //         loai: element.Loaivattu,
    //         mavattu: element.Ma_vattu,
    //         tenvattu: element.Tenvattu,
    //         nhap: __slnhap,
    //         xuat: __slxuat,
    //         ton: __slton,
    //     }
    //     console.log(data)
    //     __data.push(data)
    // });
    //console.log(__data)
    return __data
}

async function timxuatvattu(__loai){
    let __xuatvattu = await _xuatvattu.find({loai: __loai})
    return __xuatvattu
}

async function docdevices(){
    let docs = await _device.find()
    return docs
}
async function create_device(doc){
    //console.log(doc)
    try{
        await _device.create(doc)
        return true
    }catch(e){
        return false
    }
}
async function delete_device(_id){
    try {
        await _device.deleteOne({_id: _id})
        return true
    } catch (error) {
        return error
    }
    
    
}
async function docdeviceid(id){
    let docs = await _device.findById({_id: id})
    return docs
}

async function update_device(id, doc){
    //console.log(doc)
    try{
        // await _device.updateOne({_id: id}, {
        //     name: doc.name,
        //     location: doc.localtion,
        //     power: doc.power,
        //     modem: doc.modem,
        //     username: doc.username,
        //     note: doc.note
        // })
        await _device.findByIdAndUpdate(id, doc)
        return true
    }catch(e){
        return false
    }
}

module.exports = {
    docUser,
    find,
    docTb,
    xoaTb,
    timTb,
    updatetb,
    themtb,
    docTbdp2,
    xoaTbdp2,
    timTbdp2,
    updatetbdp2,
    themtbdp2,
    timvattu,
    luunhapvattu,
    luuxuatvattu,
    luumavattu,
    timnhap,
    timxuat,
    timton,
    baocaovattu,
    timxuatvattu,
    doc_createthietbi,
    them_createthietbi,
    sua_createthietbi,
    xoa_createthietbi,
    tim_createthietbi,
    sua_createthietbi,
    docdevices,
    create_device,
    delete_device,
    docdeviceid,
    update_device
}