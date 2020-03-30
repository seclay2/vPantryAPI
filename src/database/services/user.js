// ./src/database/services/user.js

const mongoose = require('mongoose')
const User = require('../models/user')
const bcrypt = require('bcrypt-nodejs')

async function createUser(user) {
    const {insertedId} = await User.create(user)
    return insertedId
}

async function samePassword(id, enteredPassword, callback){
	await User.findOne({_id:mongoose.Types.ObjectId(id)}, 'password', function(err, user){
		bcrypt.compare(enteredPassword, user.password, function(err, isValid) {
			if(isValid){
				callback(true)
			}else{
				callback(false)
			}
		})
	})
}

async function changePassword(id, newPassword){
	var hash = bcrypt.hashSync(newPassword, null)
	await User.updateOne(
		{ _id: mongoose.Types.ObjectId(id), },
			{
				$set:
				{
					password : hash
				},
			},
		)
}

function signIn(email, password, callback){
	User.findOne({'email':email}, '_id email password', function(err, user){
		if(user){
			bcrypt.compare(password, user.password, function(err, isValid) {
				if(isValid){
					callback(true, user.email, user._id)
				} else
					callback(false)
			})
		} else
			callback(false)
	})
}

async function existingEmail(email, callback){
	await User.findOne({'email':email}, 'email', function(err, user){
		if(user)
			callback(true)
		else
			callback(false)
	})
}

async function getUser(id) {
    return User.findOne({_id:mongoose.Types.ObjectId(id)})
}
function getUserIdbyEmail(email){
	return User.findOne({email:email}, '_id', function(error, user){
		if(user)
			return user._id
		else
			return null
	})
}

function getGroups(id){
	return User.findOne({_id:mongoose.Types.ObjectId(id)}, function(error, user){
		if(user)
			return user
		else
			return null
	})
}

function deleteUser(id) {
    return User.deleteOne(
        { _id: mongoose.Types.ObjectId(id) }
    )
}

async function deleteAll(){
	await User.deleteMany({})
}

function setAsAdmin(id, group_id){
	return User.findOne(
		{_id: mongoose.Types.ObjectId(id)}, function(err, user){
			if(!err){
				user.adminofgroups.push(mongoose.Types.ObjectId(group_id))
				user.save()
				return user
			}
			else
				return null
		}
	)
}

function setAsUser(id, group_id){
	return User.findOne(
		{_id: mongoose.Types.ObjectId(id)}, function(err, user){
			if(!err){
				user.userofgroups.push(mongoose.Types.ObjectId(group_id))
				user.save()
				return user
			}
			else
				return null
		}
	)
}

async function updateUserDetails(id, user) {
    await User.updateOne(
        { _id: mongoose.Types.ObjectId(id)},
        {
            $set: {
                email:user.email,
				given_name:user.given_name,
				family_name:user.family_name,
				nickname:user.nickname
            }
        }
    )
}

function getUserEmail(id){
	return User.findOne(
		{_id:mongoose.Types.ObjectId(id)}, 'email'
	)
}

function removeGroupFromUser(group_id, user_id){
	return User.findOne(
		{_id:mongoose.Types.ObjectId(user_id)}, function(err, user){
			if(user){
				var uindex = user.userofgroups.indexOf(group_id)
				var aindex = user.adminofgroups.indexOf(group_id)
				if(uindex > -1)
					user.userofgroups.splice(uindex, 1)
				if(aindex > -1)
					user.adminofgroups.splice(aindex, 1)
				user.save()
				return user
			}
			else
				return null
		}
	)
}

function getUsers(){
	return User.find({})
}

module.exports = {
    createUser,
	samePassword,
	changePassword,
	signIn,
	existingEmail,
    getUser,
	getUserIdbyEmail,
	getGroups,
    deleteUser,
	deleteAll,
	setAsAdmin,
	setAsUser,
    updateUserDetails,
	getUserEmail,
	removeGroupFromUser,
	getUsers
}