const mongoose = require('mongoose')
const Schema = mongoose.Schema

let GroupSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    creationDate: {
        type: Date,
        default: Date.now()
    },
    administrators: {
        type: [mongoose.Types.ObjectId],
		ref: 'Group',
        required: true
    },
    users: {
		type: [mongoose.Types.ObjectId],
		ref: 'Group'
	}
})

module.exports = mongoose.model('Group', GroupSchema)