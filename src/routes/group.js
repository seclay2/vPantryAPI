// ./src/routes/group.js

const express = require('express');
const router = express.Router();
const GroupService = require('../database/services/group');

router.post('/', async (req, res) => {
    const newGroup = req.body;
    await GroupService.createGroup(newGroup);
    res.status(201).send({ message: 'New group created.' });
});

router.get('/', async (req, res) => {
    res.send(await GroupService.getGroups());
});

router.get('/:id', async (req, res) => {
    res.send(await GroupService.getGroup(req.params.id));
});

router.delete('/:id', async (req, res) => {
    await GroupService.deleteGroup(req.params.id);
    res.status(204).send({ message: 'Group deleted.' });
});

router.put('/:id', async (req, res) => {
    const updatedGroup = req.body;
    await GroupService.updateGroup(req.params.id, updatedGroup);
    res.send({ message: 'Group updated.' });
});

module.exports = router;