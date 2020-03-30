// ./src/database/services/group.js

const mongoose = require('mongoose')
const Group = require('../models/group')

function createGroup(group, callback) {
	Group.create(group, function(err, group){
		callback(true, group.id)
	})
}

function getGroup(id) {
    return Group.findOne(
        { _id: mongoose.Types.ObjectId(id) }
    )
}

function deleteGroup(id) {
    return Group.deleteOne(
        { _id: mongoose.Types.ObjectId(id) }
    )
}

async function updateGroup(id, group) {
    delete group._id
    await Group.update(
        { _id: mongoose.Types.ObjectId(id), },
        {
            $set: {
                ...group,
            },
        },
    )
}

function removeUserFromGroup(user_id, group_id){
	return Group.findOne({_id:mongoose.Types.ObjectId(group_id)}, function(err, group){
			if(group){
				var uindex = group.users.indexOf(user_id)
				var aindex = group.administrators.indexOf(user_id)
				if(uindex > -1)
					group.users.splice(uindex, 1)
				if(aindex > -1)
					group.administrators.splice(aindex, 1)
				group.save()
				return group
			}
			else
				return null
		})
}

function updateGroupName(id, name){
	Group.findOne({_id:mongoose.Types.ObjectId(id)}, function(err, group){
		if(!err){
			group.name = name
			group.save()
		}
	})
}

function addAdmin(id, uId){
	Group.findOne({_id:mongoose.Types.ObjectId(id)}, function(err, group){
		if(!err){
			group.administrators.push(uId)
			group.save()
		}
	})
}

function addUser(id, uId){
	Group.findOne({_id:mongoose.Types.ObjectId(id)}, function(err, group){
		if(!err){
			group.users.push(uId)
			group.save()
		}
	})
}

module.exports = {
    createGroup,
    getGroup,
    deleteGroup,
    updateGroup,
	removeUserFromGroup,
	updateGroupName,
	addAdmin,
	addUser
}