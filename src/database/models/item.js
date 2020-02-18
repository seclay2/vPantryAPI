const mongoose = require('mongoose')
const Schema = mongoose.Schema

let ItemSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        type: String
    },
    type: {
        type: String
    },
    quantity: {
        type: String
    },
    expirationDate: {
		type: Number
    },
    note: {
        type: String
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    groupId: {
        type: mongoose.Types.ObjectId,
        ref: 'Group',
        required: true,
        default: '000000000000000000000000'
    },
}, { timestamps: true })

module.exports = mongoose.model('Item', ItemSchema)