// ./src/routes/item.js

const express = require('express')
const router = express.Router()
const auth = require('../auth')
const ItemService = require('../database/services/item')
var jwt = require('jsonwebtoken')
const UserService = require('../database/services/user')
const messages = require('../responsestrings')

router.use(auth)
router.post('/', async (req, res) => {
	var decoded = jwt.decode(req.headers.token)
	var newItem = req.body;
	newItem['userId'] = decoded._id
	var err = {}
	err['success'] = true
	try {
		if(!newItem.name){
			err.success = false
			err['name'] = messages.item_name_error
		}
		if(!newItem.type){
			err.success = false
			err['type'] = messages.item_type_error
		}
		if(err.success){
			await ItemService.createItem(newItem)
			res.send({ success : true, message: messages.item_created })
		} else
			res.send(err)
	} catch (err) {
        console.log(err)
        res.send()
    }
})

router.get('/', async (req, res) => {
	var items = await ItemService.getGroupItems(req.query.group_id)
	var itemsRet = []
	if(items.length) {
		for(var i = 0; i<items.length; i++){
			var user = await UserService.getUser(items[i].userId)
			var item = {}
			item['owner'] = user.given_name + ' ' + user.family_name + '\n' + user.email
			/*for(var key in items[i]) //not allowing the addition of owner attribute for some reason
				item[key] = items[i][key]*/
			item['groupId'] = items[i].groupId
			item['_id'] = items[i]._id
			item['expirationDate'] = items[i].expirationDate
			item['location'] = items[i].location
			item['name'] = items[i].name
			item['note'] = items[i].note
			item['quantity'] = items[i].quantity
			item['type'] = items[i].type
			item['userId'] = items[i].userId
			item['createdAt'] = items[i].createdAt
			item['updatedAt'] = items[i].updatedAt
			itemsRet.push(item)
		}
		res.send({success:true, items:itemsRet})
	}
	else
		res.send({success:false, message : messages.no_items})
})

router.delete('/', async (req, res) => {
	if(req.query.item_id){
		var deleted = await ItemService.deleteItem(req.query.item_id)
		if(deleted.deletedCount == 1)
			res.send({ success : true, message: messages.item_deleted })
		else
			res.send({success : false, message: messages.item_not_deleted})
	}
})

router.put('/', async (req, res) => {
	var decoded = jwt.decode(req.headers.token)
	var updatedItem = req.body
	var err = {}
	err['success'] = true
	try {
		if(!updatedItem.name){
			err.success = false
			err['name'] = messages.item_name_error
		}
		if(!updatedItem.type){
			err.success = false
			err['type'] = messages.item_type_error
		}
		if(err.success){
			await ItemService.updateItem(updatedItem)
			res.send({success:true, message: messages.item_updated })
		} else
			res.send(err)
	} catch (err) {
        console.log(err)
        res.send()
    }
});

module.exports = router
