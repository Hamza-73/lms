const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const ProjectRequest = require('../models/ProjectRequest');
const User = require('../models/User');
const Supervisor = require('../models/Supervisor');

router.get('/projects', async (req, res) => {
    try {
        const projects = await ProjectRequest.find();
        if (!projects) {
            return res.status(404).json({ message: 'Projects not found' });
        }

        // Filter available projects
        const availableProjects = projects.filter(project => {
            return !project.status;
        });
        const filter = availableProjects.filter( project => {
            return project.supervisor;
        })
        // Create an array to store project details with supervisor and students
        const projectDetails = await Promise.all(filter.map(async project => {
            const supervisor = project.supervisor ? await Supervisor.findById(project.supervisor) : null;
            const studentsDetail = await Promise.all(project.students.map(async stuId => {
                const student = await User.findById(stuId);
                return {
                    name: student.name,
                    rollNo: student.rollNo,
                    username : student.username
                };
            }));

            return {
                projectDetails: project,
                supervisor : supervisor ? supervisor.name  : null ,
                supUsername : supervisor ? supervisor.username  : null ,
                studentsDetail,
            };
        }));

        res.json({ success: true, projectDetails });
    } catch (error) {
        console.error('error is ', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;