const mongooge = require("mongoose")
const Schema = mongooge.Schema
const schema = new Schema({
    name: {type: String, required: true},
    location: {type: String, required: false},
    power: {type: Number, required: false},
    modem: {type: String, required: false},
    note: {type: String, required: false},
    username: {type: String, required: false}
})


module.exports = mongooge.model('device', schema, 'device')