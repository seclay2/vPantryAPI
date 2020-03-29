// ./src/routes/group.js

const express = require('express')
const router = express.Router()
var auth = require('../auth')
const GroupService = require('../database/services/group')
const UserService = require('../database/services/user')
const ItemService = require('../database/services/item')
const messages = require('../responsestrings')
var jwt = require('jsonwebtoken')

router.use(auth)
router.post('/', async (req, res) => {
	var decoded = jwt.decode(req.headers.token)
	try {
		const newGroup = req.body
		console.log(JSON.stringify(newGroup))
		var err = {}
		err['success'] = true
		err['admins'] = []
		err['users'] = []
		userIds = []
		adminIds = []
		adminIds.push(decoded._id)
		if(!newGroup.name){
			console.log("Group does not havea  name!")
			err.success = false
			err['group_name'] = messages.group_name_error
		}
		if(newGroup.administrators && newGroup.administrators.length)
			for(var i = 0; i < newGroup.administrators.length; i++){
				var admin = await UserService.getUserIdbyEmail(newGroup.administrators[i])
				if(admin){
					adminIds.push(admin._id)
					err.admins.push("")
				} else {
					err.success = false
					err.admins.push(messages.user_not_found)
				}
			}
		if(newGroup.users && newGroup.users.length)
			for(var i = 0; i < newGroup.users.length; i++){
				var user = await UserService.getUserIdbyEmail(newGroup.users[i])
				if(user){
					userIds.push(user._id)
					err.users.push("")
				} else {
					err.success = false
					err.users.push(messages.user_not_found)
				}
			}
		if(err.success){
			newGroup.administrators = adminIds
			newGroup.users = userIds
			GroupService.createGroup(newGroup, async function(result, id){
				if(result){
					for(var i = 0; i<userIds.length; i++)
						await UserService.setAsUser(userIds[i], id)
					for(var i = 0; i<adminIds.length; i++)
						await UserService.setAsAdmin(adminIds[i], id)
					res.send({ success :true, message: messages.group_created })
				}
			})
		} else {
			res.send(err)
		}
	} catch (err) {
        console.log(err)
        res.send()
    }
})

router.get('/', async (req, res) => {
	if(!req.query.group_id){//Get all groups for a user
		var decoded = jwt.decode(req.headers.token)
		var usergroups = await UserService.getGroups(decoded._id)
		var data = {}
		var groups = []
		for(var i = 0; i<usergroups.userofgroups.length; i++){
			var group =  {}
			var g = await GroupService.getGroup(usergroups.userofgroups[i])
			group['creationDate'] = g.creationDate
			group['_id'] = g._id
			group['users'] = g.users
			group['administrators'] = g.administrators
			group['name'] = g.name
			group['admin'] = false
			groups.push(group)
		}
		for(var i = 0; i<usergroups.adminofgroups.length; i++){
			var group = {}
			var g = await GroupService.getGroup(usergroups.adminofgroups[i])
			group['creationDate'] = g.creationDate
			group['_id'] = g._id
			group['users'] = g.users
			group['administrators'] = g.administrators
			group['name'] = g.name
			group['admin'] = true
			groups.push(group)
		}
		if(groups.length)
			res.send({success : true, pantries:groups, user_id:decoded._id})
		else
			res.send({success : false, message : messages.no_groups})
	} else {//Get a specific group
		var decoded = jwt.decode(req.headers.token)
		var group = await GroupService.getGroup(req.query.group_id)
		if(group){
			for(var i = 0; i<group.users.length; i++){
				var you = false
				if(group.users[i] == decoded._id)
					you = true
				var user = await UserService.getUserEmail(group.users[i])
				group.users[i] = user.email
				if(you)
					group.users[i] += " (you)"
			}
			for(var i = 0; i<group.administrators.length; i++){
				var you = false
				if(group.administrators[i] == decoded._id)
					you = true
				var user = await UserService.getUserEmail(group.administrators[i])
				group.administrators[i] = user.email
				if(you)
					group.administrators[i] += " (you)"
			}
			res.send({success : true, pantry:group})
		} else
			res.send({success: false, message:messages.no_group})
	}
})

router.put('/', async (req, res) => {//Not done
	var decoded = jwt.decode(req.headers.token)
	var userId = decoded._id
	var group = req.body
	var mode = group.mode
	var ogGroup = await GroupService.getGroup(group._id)
	var err = {}
	err['success'] = true
	err['admins'] = []
	err['users'] = []
	if(mode == 1){//Update group name
		if(!group.name){
			err.success = false
			err['group_name'] = messages.group_name_error
		}
		if(err.success){
			await GroupService.updateGroupName(group._id, userId)
			res.send({success : true, message:messages.group_name_updated})
		} else
			res.send(err)
	} else if(mode == 2){//Delete a user or admin
		var updatedGroup = {}
		if(group.remove_user==userId){//Group member leaving group
			updatedGroup = await GroupService.removeUserFromGroup(group._id, group.remove_user)
			await UserService.removeGroupFromUser(userId, group._id)
			res.send({success:true, message:messages.left_group})
		} else {//Group member is deleting another member
			if(ogGroup.administrators.indexOf(userId)>-1){//Make sure said member deleting other member is an administrator
				updatedGroup = await GroupService.removeUserFromGroup(group._id, group.remove_user)
				await UserService.removeGroupFromUser(userId, group._id)
				res.send({success:true, message:messages.user_removed})
			} else
				res.send({success:false, message:messages.not_admin})
		}
		if(!updatedGroup.administrators.length)
			deleteGroup(group._id, ogGroup)
	} else if(mode == 3){//A member is trying to add another member
		if(ogGroup.administrators.indexOf(userId)>-1){
			userIds = []
			adminIds = []
			if(group.administrators && group.administrators.length)
				for(var i = 0; i < group.administrators.length; i++){
					var admin = await UserService.getUserIdbyEmail(group.administrators[i])
					if(admin){
						adminIds.push(admin._id)
						err.admins.push("")
					} else {
						err.success = false
						err.admins.push(messages.user_not_found)
					}
				}
			if(group.users && group.users.length)
				for(var i = 0; i < group.users.length; i++){
					var user = await UserService.getUserIdbyEmail(group.users[i])
					if(user){
						userIds.push(user._id)
						err.users.push("")
					} else {
						err.success = false
						err.users.push(messages.user_not_found)
					}
				}
				
			if(err.success){
				group.administrators = adminIds
				group.users = userIds
				for(var i = 0; i<group.administrators.length; i++){
					await GroupService.addAdmin(group._id, group.administrators[i])
					await UserService.setAsAdmin(userId, group._id)
				}
				for(var i = 0; i<group.users.length; i++){
					await GroupService.addUser(group._id, group.users[i])
					await UserService.setAsUser(userId, group._id)
				}
				res.send({ success :true, message: messages.users_added })
			} else
				res.send(err)
		} else
			res.send({success:false, message:messages.not_admin})
	}
})

function deleteGroup(groupId, group){
	for(var i = 0; i<group.administrators.length; i++)
		await UserService.removeGroupFromUser(group.administrators[i], groupId)
	for(var i = 0; i<group.users.length; i++)
		await UserService.removeGroupFromUser(group.users[i], groupId)
	ItemService.deleteItemsFromGroup(groupId)
	
}

router.delete("/:id", async (req, res) => {
	var decoded = jwt.decode(req.headers.token)
	var userId = decoded._id
	var ogGroup = await GroupService.getGroup(req.query.id)
	if(ogGroup.administrators.indexOf(userId) > -1){
		deleteGroup(req.query.id, ogGroup)
	} else
		res.send({success:false, message:messages.not_admin})	
})

module.exports = router