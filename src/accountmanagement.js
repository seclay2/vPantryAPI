const UserService = require('./database/services/user')
const express = require('express')
const {check, validationResult} = require('express-validator')
const UserRoutes = require('./routes/user')
const messages = require('./responsestrings')
var jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt-nodejs')
const router = express.Router()

router.post('/signup', async (req, res) => {
    try {
        const newUser = req.body
		var err = {}
		err['success'] = true
		if(!newUser.given_name){
			err.success = false
			err['given_name'] = messages.given_name_error
		}
		if(!newUser.email){
			err.success = false
			err['email'] = messages.email_required_error
		} else if(!validEmail(newUser.email)){
			err.success = false
			err['email'] = messages.email_valid_error
		} else {
			await UserService.existingEmail(newUser.email, function(result){
				if(result){
					err.success = false
					err['email'] = messages.email_exists_error
				}
			})
		}
		if(!newUser.password){
			err.success = false
			err['password'] = messages.password_required_error
		} else {
			if(newUser.password.length < 8){
				err.success = false
				err['password'] = messages.password_valid_error
			}
		}
		if(!newUser.password2){
			err.success = false
			err['password2'] = messages.password_reenter_error
		} else if(newUser.password != newUser.password2){
			err.success = false
			err['password2'] = messages.matching_password_error
		}
		if(err.success){
			await UserService.createUser(newUser);
			res.send({success:true, message: messages.new_user_created})
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

router.post('/signin', async(req, res) => {
	UserService.signIn(req.body.email, req.body.password, function(result, email, _id){
		console.log("_id = " + _id)
		if(result){
			var token = jwt.sign({
				email: email, _id : _id
			}, process.env.SECRET_KEY, { expiresIn: 86400 })
			res.json({ success: true, token: token })
		} else {
			res.json({success: false, message: messages.signin_error})
		}
	})
})

module.exports = router