// ./src/routes/user.js

const express = require('express');
const {check, validationResult} = require('express-validator');
const router = express.Router();
const UserService = require('../database/services/user');

router.post('/', [
        check('given_name').not().isEmpty().withMessage('First name is required'),
        check('email').isEmail(),
        check('')
    ],
    async (req, res) => {
    try {
        const newUser = req.body;
        await UserService.createUser(newUser);
        res.send({message: 'New user created.'});
    } catch (err) {
        console.log(err);
        res.send()
    }
});

router.get('/', async (req, res) => {
    res.send(await UserService.getUsers());
});

router.get('/:id', async (req, res) => {
    res.send(await UserService.getUser(req.params.id));
});

router.delete('/:id', async (req, res) => {
    await UserService.deleteUser(req.params.id);
    res.send({ message: 'User deleted.' });
});

router.put('/:id', async (req, res) => {
    const updatedUser = req.body;
    await UserService.updateUser(req.params.id, updatedUser);
    res.send({ message: 'User updated.' });
});

module.exports = router;