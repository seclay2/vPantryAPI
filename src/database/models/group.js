const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let GroupSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    administrators: [{
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    users: [{
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Group', GroupSchema);