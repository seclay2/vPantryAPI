// ./src/database/services/item.js

const mongoose = require('mongoose')
const Item = require('../models/item')

async function deleteItems(){
	return Item.deleteMany({})
}

async function createItem(item) {
    return Item.create(item)
}

async function getItems() {
    return Item.find({})
}
function deleteItemsFromGroup(groupId){
	return Item.deleteMany({ groupId:mongoose.Types.ObjectId(groupId)})
}
async function getUserItems(id) {
    return Item.find(
        { userId: mongoose.Types.ObjectId(id) }
    )
}

async function getGroupItems(id) {
    return Item.find(
        { groupId: mongoose.Types.ObjectId(id) }
    )
}

async function getItem(id) {
    return Item.find(
        { _id: mongoose.Types.ObjectId(id) }
    )
}

function deleteItem(id) {
    return Item.deleteOne(
        { _id: mongoose.Types.ObjectId(id)}
    )
}

function updateItem(updatedItem) {
    Item.findOne(
        { _id: mongoose.Types.ObjectId(updatedItem._id)}, function(err, item){
            if(!err){
                item.name=updatedItem.name,
				item.type = updatedItem.type,
				item.quantity = updatedItem.quantity,
				item.expirationDate = updatedItem.expirationDate,
				item.note = updatedItem.note
				item.save()
            }
        }
    )
} 
module.exports = {
	deleteItems,
    createItem,
    getItems,
	deleteItemsFromGroup,
    getUserItems,
    getGroupItems,
    getItem,
    deleteItem,
    updateItem
}