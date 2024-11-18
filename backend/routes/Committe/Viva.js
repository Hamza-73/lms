const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Committee = require('../../models/Committee');
const User = require('../../models/User');
const Group = require('../../models/Group');
const Supervisor = require('../../models/Supervisor')
const { body, validationResult } = require('express-validator');
const Viva = require('../../models/Viva')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authenticateUser = require('../../middleware/auth')
const JWT_KEY = 'hamzakhan1'
const SharedRules = require('../../models/SharedRules');
const moment = require('moment');
const External = require('../../models/External');


// Schedule a viva for a specific group's project
router.post('/schedule-viva', async (req, res) => {
  try {
    const { projectTitle, vivaDate, vivaTime, external, chairperson } = req.body;

    // Use findOneAndUpdate to find and update the document
    const parsedDate = moment.utc(vivaDate, 'YYYY-MM-DDTHH:mm:ss.SSSZ').toDate();
    console.log('parsed date is ', parsedDate)

    // Validate if the vivaDate is before the current date
    const currentDate = moment().startOf('day'); // Current date without time, using moment.js

    if (moment(parsedDate).isSameOrBefore(currentDate, 'day')) {
      return res.json({ success: false, message: "Enter a valid date" });
    }

    // Find the group by project title
    const group = await Group.findOne({
      'projects.projectTitle': projectTitle
    }).populate('supervisor projects.students');

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    console.log('Group is ', group.projects[0].projectTitle)
    if (!((group.documentation || group.documentationLink) &&( group.proposal || group.proposalLink))) {
      return res.status(500).json({ success: false, message: `Documentation or Proposal is Pending` })
    }

    const externalMember = await External.findOne({ username: external });
    if (!externalMember) {
      return res.status(404).json({ success: false, message: 'External Member not found' });
    }

    externalMember.groups.forEach(grp => {
      let count = 0;
      if (new Date(grp.date) === parsedDate) {
        count += 1;
      } if (count >= 5) {
        return res.json({ success: false, message: "External Member Already have 5 Vivas Schduled on this Date" });
      }
    });

    externalMember.groups.push({
      id: group._id,
      name: projectTitle,
      date: parsedDate
    });
    console.log('external save');


    const supervisor = await Supervisor.findById(group.supervisorId);
    await externalMember.save()
    // Iterate through each project within the group and schedule a viva for each project
    group.projects.forEach(async (project) => {
      console.log('Project is ', project)
      console.log('Group projects is ', group.projects.students)
      const viva = new Viva({
        group: group._id,
        projectTitle: project.projectTitle,
        supervisor: group.supervisorId,
        sup: group.supervisor,
        students: Array.from(project.students).map(student => ({
          studentId: student.userId,
          name: student.name,
          rollNo: student.rollNo
        })),
        vivaDate: parsedDate, vivaTime: vivaTime,
        external: external, chairperson: chairperson, externalName: externalMember.name
      });
      group.viva = viva._id;
      group.vivaDate = parsedDate;
      group.external = external;
      group.externalName = externalMember.name;
      group.vivaTime = vivaTime;
      group.chairperson = chairperson;
      console.log('viva created')
      await Promise.all([group.save(), viva.save()]);
      console.log('Viva is ', viva)
      // Send notification to group users and supervisors about the scheduled viva
      const notificationMessage = `A viva has been scheduled for the project "${projectTitle}" on ${vivaDate}`;

      // Send notifications to students
      project.students.forEach(async (student) => {
        const user = await User.findById(student.userId);
        if (user) {
          user.unseenNotifications.push({ type: "Reminder", message: `${notificationMessage} at ${vivaTime} chairperson : ${chairperson}, External : ${externalMember.name}` });
          user.vivaTime = vivaTime;
          user.vivaDate = parsedDate;
          user.viva = viva._id;
          await user.save();
        }
      });
    });

    const committeemembers = await Committee.find();
    const supervisorsAdmin = await Supervisor.find({ isAdmin: true });

    committeemembers.map(async cum => {
      cum.unseenNotifications.push({
        type: "Important", message: `A viva has been scheduled for the project "${projectTitle}" on ${vivaDate} at ${vivaTime} chairperson : ${chairperson}, External : ${externalMember.name}`
      });
      await cum.save();
    })

    if (supervisorsAdmin || supervisorsAdmin.length > 0) {

      supervisorsAdmin.map(async cum => {
        cum.unseenNotifications.push({
          type: "Important", message: `A viva has been scheduled for the project "${projectTitle}" on ${vivaDate} at ${vivaTime} chairperson : ${chairperson}, External : ${externalMember.name}`
        });
        await cum.save();
      })
    }

    // Send notification to supervisor
    supervisor.unseenNotifications.push({ type: "Reminder", message: `A viva has been scheduled for the project "${projectTitle}" on ${vivaDate} at ${vivaTime} chairperson : ${chairperson}, External : ${externalMember.name}` });
    await supervisor.save();

    res.json({ success: true, message: 'Viva scheduled and notifications sent' });

  } catch (err) {
    console.error('Error scheduling viva:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.put('/edit', async (req, res) => {
  try {
    const { projectTitle, vivaDate, vivaTime, external, chairperson } = req.body;
    // Use findOneAndUpdate to find and update the document
    // Use findOneAndUpdate to find and update the document
    const parsedDate = moment.utc(vivaDate, 'YYYY-MM-DDTHH:mm:ss.SSSZ').toDate();
    console.log('parsed date is ', parsedDate)

    // Validate if the vivaDate is before the current date
    const currentDate = moment().startOf('day'); // Current date without time, using moment.js

    if (moment(parsedDate).isSameOrBefore(currentDate, 'day')) {
      return res.json({ success: false, message: "Enter a valid date" });
    }

    const group = await Group.findOne({
      'projects.projectTitle': projectTitle
    }).populate('supervisor projects.students');

    const externalMember = await External.findOne({ username: external });
    if (!externalMember) {
      return res.status(404).json({ success: false, message: 'External Member not found' });
    }

    if (external && !group.external === external) {
      console.log('external exist', external);
      externalMember.groups.push({
        id: group._id,
        name: projectTitle, date: parsedDate
      });

      externalMember.groups.forEach(grp => {
        let count = 0;
        if (new Date(grp.date) === parsedDate) {
          count += 1;
        } if (count >= 2) {
          return res.json({ success: false, message: "External Member Already have 2 Vivas Schduled on this Date" });
        }
      });
      await externalMember.save()
    }
    const updatedViva = await Viva.findOneAndUpdate(
      { projectTitle: projectTitle },
      { vivaDate: parsedDate, vivaTime: vivaTime },
      { chairperson: chairperson, external: external, externalName: externalMember.externalName },
      { new: true }
    );
    updatedViva.external = external;
    updatedViva.chairperson = chairperson;
    await updatedViva.save();
    group.vivaDate = vivaDate ? parsedDate : group.vivaDate; group.vivaTime = vivaTime;
    group.external = external; group.chairperson = chairperson;
    group.externalName = externalMember.name;
    await group.save();

    group.projects.map(proj => {
      proj.students.map(async stu => {
        const student = await User.findById(stu.userId);
        if (!student) {
          return;
        }
        student.vivaDate = parsedDate;
        student.unseenNotifications.push({
          type: "Important",
          message: `Viva Date has been changed by the Committee 
          It's now ${vivaDate} at ${vivaTime} for group: ${projectTitle}
          `
        });
        await student.save();
      })
    })
    const committeemembers = await Committee.find();
    const supervisorsAdmin = await Supervisor.find({ isAdmin: true });

    committeemembers.map(async cum => {
      cum.unseenNotifications.push({
        type: "Important", message:  `Viva Date has been changed by the Committee 
        It's now ${vivaDate} at ${vivaTime} for group: ${projectTitle}
        `
      });
      await cum.save();
    })

    if (supervisorsAdmin || supervisorsAdmin.length > 0) {

      supervisorsAdmin.map(async cum => {
        cum.unseenNotifications.push({
          type: "Important", message:  `Viva Date has been changed by the Committee 
          It's now ${vivaDate} at ${vivaTime} for group: ${projectTitle}
          `
        });
        await cum.save();
      })
    }

    // Send the updated document as the response
    res.json({ success: true, message: "Viva Updated Successfully", updatedViva });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// To get scheduled viva
router.get('/vivas', async (req, res) => {
  try {
    const vivas = await Viva.find();
    if (!vivas || vivas.length === 0) {
      return res.status(500).json({ success: false, message: 'Vivas not found' });
    }

    // Use Promise.all to wait for all asynchronous operations
    const vivaPromises = vivas.map(async (viva) => {
      const group = await Group.findById(viva.group);
      if (!group) {
        return { success: false, message: 'Group not found' };
      }
      // Add isProps and isDoc to the viva object
      return {
        ...viva.toObject(), // Convert Mongoose document to plain object
        documentation: {
          proposal: group.proposal,
          documentation: group.documentation,
        }
      };
    });

    // Wait for all promises to resolve
    const vivaResults = await Promise.all(vivaPromises);

    res.json({ success: true, message: 'Viva fetched successfully', vivas: vivaResults });

  } catch (error) {
    console.error('Error fetching scheduled vivas ', error);
    res.status(404).json({ success: false, message: 'Internal server error' });
  }
});


//get my detail
router.get('/detail', authenticateUser, async (req, res) => {
  try {
    const studentId = req.user.id; // Get the authenticated user's ID from the token payload

    const student = await Committee.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: 'Member not found' });
    }
    // Return the student details
    return res.json(student);
  } catch (error) {
    console.error('error is ', error)
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;