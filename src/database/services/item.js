// ./src/database/services/item.js

const mongoose = require('mongoose');
const Item = require('../models/item');

async function createItem(item) {
    return Item.create(item);
}

async function getItems() {
    return Item.find({});
}

async function getUserItems(id) {
    return Item.find(
        { userId: mongoose.Types.ObjectId(id) }
    );
}

async function getGroupItems(id) {
    return Item.find(
        { groupId: mongoose.Types.ObjectId(id) }
    );
}

async function getItem(id) {
    return Item.find(
        { _id: mongoose.Types.ObjectId(id) }
    );
}

async function deleteItem(id) {
    await Item.deleteOne(
        { _id: mongoose.Types.ObjectId(id) }
    );
}

async function updateItem(id, item) {
    delete item._id;
    await Item.update(
        { _id: mongoose.Types.ObjectId(id), },
        {
            $set: {
                ...item,
            },
        },
    );
}

module.exports = {
    createItem,
    getItems,
    getUserItems,
    getGroupItems,
    getItem,
    deleteItem,
    updateItem
};