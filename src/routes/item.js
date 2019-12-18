// ./src/routes/item.js

const express = require('express');
const router = express.Router();
const ItemService = require('../database/services/item');

router.post('/', async (req, res) => {
    const newItem = req.body;
    await ItemService.createItem(newItem);
    res.send({ message: 'New item created.' });
});

router.get('/', async (req, res) => {
    res.send(await ItemService.getItems());
});

router.get('/user/:id', async (req, res) => {
    res.send(await ItemService.getUserItems(req.params.id));
});

router.get('/group/:id', async (req, res) => {
    res.send(await ItemService.getGroupItems(req.params.id));
});

router.get('/:id', async (req, res) => {
    res.send(await ItemService.getItem(req.params.id));
});

router.delete('/:id', async (req, res) => {
    await ItemService.deleteItem(req.params.id);
    res.send({ message: 'Item deleted.' });
});

router.put('/:id', async (req, res) => {
    const updatedItem = req.body;
    await ItemService.updateItem(req.params.id, updatedItem);
    res.send({ message: 'Item updated.' });
});

module.exports = router;