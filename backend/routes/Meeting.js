const express = require('express');
const mongoose = require('mongoose')
const router = express.Router();
const Supervisor = require('../models/Supervisor');
const User = require('../models/User');
const authenticateUser = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const JWT_KEY = 'hamzakhan1'; // Replace with your actual JWT secret key
const bcrypt = require('bcryptjs');
var jwt = require("jsonwebtoken");
const Group = require('../models/Group')
const ProjectRequest = require('../models/ProjectRequest');
const Meeting = require('../models/Meeting');
const moment = require('moment');

router.post('/meeting', authenticateUser, async (req, res) => {
  try {
    const { meetingLink, projectTitle, date, time, type, purpose } = req.body;

    // Check if a meeting with the same projectTitle and future meeting time exists
    const existingMeeting = await Meeting.findOne({ projectTitle: projectTitle });

    if (existingMeeting) {
      return res.status(400).json({ message: `Meeting with ${projectTitle} already scheduled` });
    }

    const group = await Group.findOne({
      'projects.projectTitle': projectTitle
    }).populate('supervisor projects.students');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    const supervisor = await Supervisor.findById(req.user.id);

    if (!supervisor) {
      return res.status(404).json({ message: 'Supervisor not found' });
    }

    if (!supervisor._id.equals(group.supervisorId)) {
      return res.status(404).json({ message: 'Group doesnot belong to you' });
    }

    const parsedDate = moment.utc(date, 'YYYY-MM-DDTHH:mm:ss.SSSZ').toDate();


    // Check if parsedDate is a valid date
    if (!moment(parsedDate).isValid()) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const meeting = new Meeting({
      projectTitle: projectTitle, supervisor: group.supervisor,
      supervisorId: group.supervisorId, meetingLink: meetingLink,
      purpose: purpose, time: time, date: parsedDate, type: type
    });
    await meeting.save();

    const check = await Meeting.findById(meeting._id);
    if (!check) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    const studentIds = group.projects.flatMap(proj => proj.students.map(student => student.userId));

    // Send notifications to students
    const messageToStudents = `Meeting Scheduled for ${projectTitle} on ${date} at ${time} by ${supervisor.name}`;
    await Promise.all(studentIds.map(async (studentId) => {
      const student = await User.findById(studentId);
      if (student) {
        student.meetingId = meeting._id; student.meetingLink = meetingLink;
        student.meetingTime = time; student.meetingDate = parsedDate;
        student.unseenNotifications.push({ type: 'Reminder', message: messageToStudents });
        await student.save();
      }
    }));

    // Send a notification to the supervisorsupervisor.meetingId = meeting._id;
    supervisor.meeting.push(meeting._id);
    group.meetingid = meeting._id;
    group.meetingDate = parsedDate;
    group.meetingTime = time;
    group.meetingLink = meetingLink;
    group.meetingPurpose = purpose;
    group.meetingReport.push({
      id: meeting._id, date: parsedDate, review: null
    });
    await group.save()
    const messageToSupervisor = `You scheduled a meeting with group ${projectTitle}`;
    supervisor.unseenNotifications.push({ type: 'Reminder', message: messageToSupervisor });
    await supervisor.save();
    return res.json({ success: true, message: "Meeting Schdeuled Successfully", meeting });

  } catch (error) {
    console.error('Error scheduling meeting:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update a meeting by ID
router.put('/edit-meeting/:id', async (req, res) => {
  let { id } = req.params;
  const updatedMeetingData = req.body;

  try {
    console.log('id is ', id)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      id = new mongoose.Types.ObjectId(id);
    }

    const existingMeeting = await Meeting.findById(id);

    if (!existingMeeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    console.log('existing group ', existingMeeting.projectTitle)
    const group = await Group.findOne({
      'projects': {
        $elemMatch: {
          'projectTitle': existingMeeting.projectTitle
        }
      }
    });
    if (!group) {
      return res.status(404).json({ success: false, message: "Group Not Found" })
    }

    group.meetingDate = updatedMeetingData.date ? updatedMeetingData.date : group.meetingDate;
    group.meetingTime = updatedMeetingData.time ? updatedMeetingData.time : group.meetingTime
    group.meetingLink = updatedMeetingData.meetingLink ? updatedMeetingData.meetingLink : group.meetingLink;
    await group.save();

    // Update the Meeting document
    const updatedMeeting = await Meeting.findByIdAndUpdate(
      id,
      { $set: updatedMeetingData },
      { new: true } // Return the updated meeting
    );

    if (!updatedMeeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    group.projects[0].students.map(async st => {
      const studentObj = await User.findById(st.userId);
      studentObj.unseenNotifications.push({
        type: "Important", message: `Meeting has been re-scheduled by the supervisor see MyGroup for details`
      });
      await studentObj.save();
    });
    
    const superviors = await Supervisor.findById(group.supervisorId);
    superviors.unseenNotifications.push({ type: "Reminder", message: `A meeting of ${group.projects[0].projectTitle} was re-scheduled` });
    await superviors.save()

    return res.json({ success: true, meeting: updatedMeeting });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


router.get('/get-meeting', authenticateUser, async (req, res) => {
  try {
    const supervisor = await Supervisor.findById(req.user.id);
    if (!supervisor) {
      return res.status(404).json({ message: 'Supervisor not Found' });
    }

    const meetingPromises = supervisor.meeting.map(async (id) => {
      const meet = await Meeting.findById(id);
      if (!meet) {
        return null; // Return null for meetings that are not found
      }
      return {
        meetingId: meet._id, meetingGroup: meet.projectTitle,
        meetingTime: meet.time, meetingDate: meet.date,
        meetingLink: meet.meetingLink, purpose: meet.purpose
      };
    });

    // Use Promise.all to await all the promises
    const meetingData = await Promise.all(meetingPromises);

    // Remove null entries (meetings that were not found)
    const validMeetings = meetingData.filter((meeting) => meeting !== null);

    return res.json({ success: true, meeting: validMeetings });
  } catch (error) {
    // Handle errors appropriately
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Delete a meeting by ID
router.delete('/delete-meeting/:id', async (req, res) => {
  let { id } = req.params;

  try {
    console.log('id is ', id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      id = new mongoose.Types.ObjectId(id);
    }
    console.log('is after if ', id);
    const deletedMeeting = await Meeting.findById(id);
    if (!deletedMeeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    console.log('meeting is ', deletedMeeting);
    const group = await Group.findOne({ 'projects.projectTitle': deletedMeeting.projectTitle });
    if (group) {
      group.projects[0].students.map(async stu => {
        console.log('stu is ', stu);
        const studentObj = await User.findById(stu.userId);
        if (studentObj) {
          studentObj.unseenNotifications.push({
            type: "Important", message: "You're Meeting Time has been Cancelled "
          });
          await studentObj.save();
        }
      });
    }

    group.meetingLink = ''; group.meetingDate = '';
    group.meetingTime = ''; group.meetingid = null;
    group.meetingReport = group.meetingReport.filter(meet => {
      console.log('meet is ', meet);
      return !meet.id.equals(id)
    });
    console.log(" group.meetingReport  ", group.meetingReport)
    await group.save();

    const meetingToBeDelete = await Meeting.findByIdAndDelete(id);
    if (!meetingToBeDelete) {
      return res.json({ success: false, message: "Meeting Not Found" });
    }
    return res.json({ success: true, message: "Canceled" })

  } catch (error) {
    console.error('error in deleting ', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.put('/meeting-review/:meetingId/:review', authenticateUser, async (req, res) => {
  try {
    const { meetingId, review } = req.params;
    console.log('review is ', review)
    const supervisor = await Supervisor.findById(req.user.id);
    if (!supervisor) {
      return res.status(404).json({ message: 'Supervisor not found' });
    }
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    const group = await Group.findOne({
      'projects.projectTitle': meeting.projectTitle
    });
    if (!group) {
      return res.status(200).json({ message: `Group Not Found` });
    }

    let index = -1;
    // Find the index of the meeting in the array
    group.meetingReport.forEach((meet, key) => {
      if (meet.id.equals(meeting._id)) {
        index = key;
      }
    });

    if (index === -1) {
      return res.json({ success: false, message: "Meeting Not Found in Group" });
    }

    // Update the review
    group.meetings.push({
      date: group.meetingReport[index].date,
      review: review,
      value: review ? 5 : 3
    })
    group.meetingReport[index].review = review;
    if (review) {
      group.meetingReport[index].value = 5;
      group.meeting = group.meeting + 1;
    } else {
      group.meetingReport[index].value = 3;
    }
    await group.save(); // Save the changes

    await Meeting.findByIdAndDelete(meeting._id);

    return res.json({ success: true, message: "Reviews Given Successfully" });
  } catch (error) {
    // Handle errors here
    console.error('error i giving review', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/supervisor', authenticateUser, async (req, res) => {
  const supervisorId = req.user.id;

  try {
    const groups = await Group.find({ supervisorId: supervisorId });

    if (!groups) {
      return res.status(404).json({ message: 'No groups found for this supervisor.' });
    }
    const projectTitles = groups.map(group => group.projects.map(project => project.projectTitle)).flat();

    res.status(200).json({ projectTitles });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});


module.exports = router;