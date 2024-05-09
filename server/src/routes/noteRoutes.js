const express = require('express');
const User = require('../models/Note');  // ensure the path to your user model is correct
const router = express.Router();

router.post('/:userId/notes', async (req, res) => {
    const { userId } = req.params;
    const { title, content, image } = req.body;

    try {
        const newNote = new Note({
            title,
            content,
            image,
            userId  // Link this note to the user
        });

        await newNote.save();
        res.status(201).json(newNote);
    } catch (error) {
        console.error("Error adding note:", error);
        res.status(500).send("Failed to add note");
    }
});

// Additional routes can be added here

module.exports = router;