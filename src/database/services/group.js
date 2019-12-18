// ./src/database/services/group.js

const mongoose = require('mongoose');
const Group = require('../models/group');

async function createGroup(group) {
    return Group.create(group);
}

async function getGroups() {
    return Group.find({});
}

async function getGroup(id) {
    return Group.find(
        { _id: mongoose.Types.ObjectId(id) }
    );
}

async function deleteGroup(id) {
    await Group.deleteOne(
        { _id: mongoose.Types.ObjectId(id) }
    );
}

async function updateGroup(id, group) {
    delete group._id;
    await Group.update(
        { _id: mongoose.Types.ObjectId(id), },
        {
            $set: {
                ...group,
            },
        },
    );
}

module.exports = {
    createGroup,
    getGroups,
    getGroup,
    deleteGroup,
    updateGroup
};