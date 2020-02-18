// ./src/routes/user.js
const UserService = require('../database/services/user')
const GroupService = require('../database/services/group')
const express = require('express')
var auth = require('../auth')
const router = express.Router()
var jwt = require('jsonwebtoken')
const messages = require('../responsestrings')
const bcrypt = require('bcrypt-nodejs')

router.use(auth)

router.get('/', async (req, res) => {
	var decoded = jwt.decode(req.headers.token)
	res.send(await UserService.getUser(decoded._id))
})

router.delete('/', async (req, res) => {
	var decoded = jwt.decode(req.headers.token)
	var user = await UserService.getUser(decoded._id)
	console.log("user = " + JSON.stringify(user))
	for(var i = 0; i<user.userofgroups.length; i++)
		await GroupService.removeUserFromGroup(decoded._id, user.userofgroups[i])
	for(var i = 0; i<user.adminofgroups.length; i++)
		await GroupService.removeUserFromGroup(decoded._id, user.adminofgroups[i])
	var deleted = await UserService.deleteUser(decoded._id)
	if(deleted.deletedCount == 1)
		res.send({ success : true, message: messages.account_deleted })
	else
		res.send({success : false, message: messages.account_not_deleted})
})

router.put('/changepassword', async(req, res) => {
	try{
		var decoded = jwt.decode(req.headers.token)
		const updatedPasswords = req.body
		var err = {}
		err['success'] = true
		if(!updatedPasswords.password){
			err.success = false
			err['password'] = messages.password_required_error
		} else {
			if(updatedPasswords.password.length < 8){
				err.success = false
				err['password'] = messages.password_valid_error
			}
		}
		if(!updatedPasswords.password2){
			err.success = false
			err['password2'] = messages.password_reenter_error
		} else if(updatedPasswords.password != updatedPasswords.password2){
			err.success = false
			err['password2'] = messages.matching_password_error
		}
		if(!updatedPasswords.old_password){
			err.success = false
			err['old_password'] = messages.password_required_error
			res.send(err)
		} else {
			UserService.samePassword(decoded._id, updatedPasswords.old_password, function(match){
				if(!match){
					err.success = false
					err['old_password'] = messages.wrong_password_error
				}
				if(err.success){
					UserService.changePassword(decoded._id, updatedPasswords.password)
					res.send({success:true, message: messages.password_changed})
				} else
					res.send(err)
			})
		}
	} catch (err) {
        console.log(err)
        res.send()
    }
})

router.put('/', async (req, res) => {
	try {
		var decoded = jwt.decode(req.headers.token)
		var ogUser = await UserService.getUser(decoded._id)
		const updatedUser = req.body;
		var err = {}
		err['success'] = true
		if(ogUser.email == updatedUser.email && ogUser.given_name == updatedUser.given_name && ogUser.family_name == updatedUser.family_name && ogUser.nickname == updatedUser.nickname){
			err.success = false
			res.send(err)
		}
		if(!updatedUser.given_name){
			err.success = false
			err['given_name'] = messages.given_name_error
		}
		if(updatedUser.email != ogUser.email){
			if(!updatedUser.email){
				err.success = false
				err['email'] = messages.email_required_error
			} else if(!validEmail(updatedUser.email)){
				err.success = false
				err['email'] = messages.email_valid_error
			} else {
				await UserService.existingEmail(updatedUser.email, function(result){
					if(result){
						err.success = false
						err['email'] = messages.email_exists_error
					}
				})
			}
		}
		if(err.success){
			await UserService.updateUserDetails(decoded._id, updatedUser)
			res.send({ success : true, message: messages.updated_user })
		} else
			res.send(err)
	} catch (err) {
        console.log(err)
        res.send()
    }
})
function validEmail(email) {
  var re = /^(?:[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/
  return re.test(email)
}
module.exports = router