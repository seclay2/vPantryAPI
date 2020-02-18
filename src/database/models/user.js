const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt-nodejs')

let UserSchema = new Schema({
    given_name: {
        type: String,
    },
    family_name: {
        type: String,
    },
    nickname: {
        type: String,
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    adminofgroups: {
		type:[mongoose.Types.ObjectId],
		ref: 'Group'
	},
	userofgroups:{
		type:[mongoose.Types.ObjectId],
		ref: 'Group'
	}
}, { timestamps: true })

UserSchema.pre('save', function(callback) {
    let user = this
    // hash the password only if the password has been changed or user is new
    if (!user.isModified('password')) return callback()
    // generate the hash
    bcrypt.hash(user.password, null, null, function(err, hash) {
        if (err) return callback(err)
        // change the password to the hashed version
        user.password = hash
        callback()
    })
})

//Comparing password in DB and the one provided by user if does match
UserSchema.methods.comparePassword = function(password, callback) {
    let user = this
    bcrypt.compare(password, user.password, function(err, isValid) {
        callback(isValid)
    })
}

module.exports = mongoose.model('User', UserSchema)