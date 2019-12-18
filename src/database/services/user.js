// ./src/database/services/user.js

const mongoose = require('mongoose');
const User = require('../models/user');

async function createUser(user) {
    const {insertedId} = await User.create(user);
    return insertedId;
}

async function getUsers() {
    return User.find({});
}

async function getUser(id) {
    return User.find(
        { _id: mongoose.Types.ObjectId(id) }
    );
}

async function deleteUser(id) {
    await User.deleteOne(
        { _id: mongoose.Types.ObjectId(id) }
    );
}

async function updateUser(id, user) {
    delete user._id;
    await User.update(
        { _id: mongoose.Types.ObjectId(id), },
        {
            $set: {
                ...user,
            },
        },
    );
}

module.exports = {
    createUser,
    getUsers,
    getUser,
    deleteUser,
    updateUser
};