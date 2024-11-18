const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Allocation = require('../models/Allocation');
const Group = require('../models/Group');

router.get('/list', async (req, res) => {
    try {
        const list = await Allocation.find();
        if (!list) {
            return res.json({ message: "No Group Allocated Yet" });
        }
        return res.json({ success: true, list })
    } catch (error) {
        console.error('error getting allocation list', error);
        res.json({ message: "Internal Server Error" })
    }
});

// Route to get projectTitle from groups
router.get('/groups', async (req, res) => {
    try {
      const projects = await Group.distinct('projects.projectTitle'); // Retrieve distinct projectTitle values from the projects array
      res.status(200).json(projects); // Send the projectTitle values in the response
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

module.exports = router;