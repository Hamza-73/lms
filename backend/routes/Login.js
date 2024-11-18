const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const JWT_KEY = 'hamzakhan1'
const authenticateUser = require('../middleware/auth');
const Supervisor = require('../models/Supervisor');
const ProjectRequest = require('../models/ProjectRequest');
const Group = require('../models/Group');
const moment = require('moment');
const multer = require('multer');
const Viva = require('../models/Viva');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    console.log(file)
    cb(null, file.originalname)
  }
})

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dfexs9qho',
  api_key: '798692241663155',
  api_secret: '_zRYx_DFqV6FXNK664jRFxbKRP8'
});

const Admin = require('../models/Admin');

const nodemailer = require('nodemailer')

router.post('/upload', authenticateUser, async (req, res) => {
  try {
    const { type ,link } = req.body;
    console.log('doc start')
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Student Not Found' });
    }

    const groupUpdate = await Group.findById(user.group);
    if (!groupUpdate) {
      return res.status(404).json({ success: false, message: 'Group Not Found' });
    }


    if (type === 'proposal' && !groupUpdate.propDate) {
      return res.status(500).json({ success: false, message: 'Deadline for Proposal Has Not Been Announced Yet.' });
    }

    if (type === 'documentation' && !groupUpdate.docDate) {
      return res.status(500).json({ success: false, message: 'Deadline for Documentation Has Not Been Announced Yet.' });
    }

    let file = req.files;
    console.log('file is outside', file)
    if (file) {
      console.log('if start')
      file = req.files[type]
      console.log('file is ', file);

      const result = await cloudinary.uploader.upload(file.tempFilePath);
      // Update the group with the final URL
      if (type === 'proposal') {
        console.log('at proposal');
        groupUpdate.proposal = result.url;
        groupUpdate.proposalLink = link ? link : "";
        groupUpdate.propSub = new Date().toLocaleDateString('en-GB');
      } else if (type === 'documentation') {
        groupUpdate.documentation = result.url;
        groupUpdate.documentationLink = link ? link : "";
        groupUpdate.docSub = new Date().toLocaleDateString('en-GB');
      } else {
        return res.status(400).json({ success: false, message: 'Invalid file type' });
      }
      groupUpdate.projects[0].students.map(async stu => {
        const studentObj = await User.findById(stu.userId);
        studentObj.unseenNotifications.push({
          type: "Important", message: `${type} has been uploaded`
        })
        await studentObj.save();
      })
      const Superisor = await Supervisor.findById(groupUpdate.supervisorId);
      Superisor.unseenNotifications.push({
        type: "Reminder", message: `${type} uploaded by group : ${groupUpdate.projects[0].projectTitle}`
      })
      await Promise.all([Superisor.save(), groupUpdate.save()]);

      // Return the Cloudinary URL in the response
      return res.status(201).json({ success: true, message: 'PDF uploaded successfully', url: result.url, link: link ? link : "" });

    } else {
      console.log('else part')
      if (type === 'proposal') {
        console.log('at proposal');
        groupUpdate.proposalLink = link ;
        groupUpdate.propSub = new Date().toLocaleDateString('en-GB');
      } else if (type === 'documentation') {
        groupUpdate.documentationLink = link;
        groupUpdate.docSub = new Date().toLocaleDateString('en-GB');
      } else {
        return res.status(400).json({ success: false, message: 'Invalid file type' });
      }
      
      groupUpdate.projects[0].students.map(async stu => {
        const studentObj = await User.findById(stu.userId);
        studentObj.unseenNotifications.push({
          type: "Important", message: `${type} has been uploaded`
        })
        await studentObj.save();
      })

      const Superisor = await Supervisor.findById(groupUpdate.supervisorId);
      Superisor.unseenNotifications.push({
        type: "Reminder", message: `${type} uploaded by group : ${groupUpdate.projects[0].projectTitle}`
      })
      await Promise.all([Superisor.save(), groupUpdate.save()]);

      // Return the Cloudinary URL in the response
      return res.status(201).json({ success: true, message: 'Link uploaded successfully', link: link });
    }

  } catch (error) {
    console.error('Error uploading PDF:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


router.post('/doc', authenticateUser, async (req, res) => {
  try {
    console.log('doc start')
    // Check if the user belongs to the specified group
    const { comment, link } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Student Not Found' });
    }

    const groupUpdate = await Group.findById(user.group);
    if (!groupUpdate) {
      return res.status(404).json({ success: false, message: 'Group Not Found' });
    }

    let file = req.files;
    console.log('file is ', file);
    if (file) {
      file = req.files.doc
      console.log('file is ', file);

      const result = await cloudinary.uploader.upload(file.tempFilePath);
      console.log('result is ', result);
      if (!groupUpdate.docs) {
        groupUpdate.docs = []
      }
      groupUpdate.docs.push({
        docLink: result.url, review: "", comment: comment, link: link ? link : ""
      });
      groupUpdate.projects[0].students.map(async stu => {
        const studentObj = await User.findById(stu.userId);
        studentObj.unseenNotifications.push({
          type: "Important", message: `Document has been uploaded`
        })
        await studentObj.save();
      })
      const Superisor = await Supervisor.findById(groupUpdate.supervisorId);
      Superisor.unseenNotifications.push({
        type: "Reminder", message: `A document has been uploaded by group : ${groupUpdate.projects[0].projectTitle}`
      })
      await Promise.all([Superisor.save(), groupUpdate.save()]);

      // Return the Cloudinary URL in the response
      return res.status(201).json({ success: true, message: 'PDF uploaded successfully', url: result.url, link: link ? link : "" });

    } else {
      console.log('else part')
      groupUpdate.docs.push({
        docLink: "", review: "", comment: comment, link: link ? link : ""
      });
      groupUpdate.projects[0].students.map(async stu => {
        const studentObj = await User.findById(stu.userId);
        studentObj.unseenNotifications.push({
          type: "Important", message: `Document has been uploaded`, link: link ? link : ""
        })
        await studentObj.save();
      })

      const Superisor = await Supervisor.findById(groupUpdate.supervisorId);
      Superisor.unseenNotifications.push({
        type: "Reminder", message: `A document has been uploaded by group : ${groupUpdate.projects[0].projectTitle}`
      })
      await Promise.all([Superisor.save(), groupUpdate.save()]);

      // Return the Cloudinary URL in the response
      return res.status(201).json({ success: true, message: 'Link uploaded successfully', link: link ? link : "" });
    }

  } catch (error) {
    console.error('Error uploading PDF:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user by rollNo : username
    const user = await User.findOne({ rollNo: username });
    if (!user) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const check = await bcrypt.compare(password, user.password)

    // Check if supervisor exists and if the password matches
    if (check) {
      // Generate JWT token
      const token = jwt.sign({ id: user.id }, JWT_KEY);

      // Save the token to the user's token field in the database
      user.token = token;
      user.login = user.login + 1;
      if (user.login === 1) {
        user.unseenNotifications.push({
          type: "Important", message: "You can reset password now after 1st login link has been sent to your email and will be expired after 24 hours."
        });
        const token = jwt.sign({ id: user.id }, JWT_KEY, { expiresIn: '1d' });

        var transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'YOUR_EMAIL',
            pass: 'YOUR_PASSWORD'
          }
        });

        var mailOptions = {
          from: 'YOUR_EMAIL',
          to: user.email,
          subject: 'Reset Password Link',
          html: `<h4>The Link will expire in 24 hours</h4> <br> <p><strong>Link:</strong> <a href="http://localhost:3000/supervisorMain/reset_password/${user._id}/${token}">http://localhost:3000/supervisorMain/reset_password/${user._id}/${token}</a></p>
        <p>The link will expire in 24 minutes.</p>`
        };
        // console.log('mailoption is')
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            return res.send({ success: true, message: "Check Your Email" })
          }
        });
      }
      await user.save();

      // Send the token in the response
      res.json({ message: 'Login successful', success: true, token });
    } else {
      res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
  } catch (err) {
    console.error('error in logging', err)
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


// Registration route
router.post('/register', [
  body('name', 'Name should be at least 3 characters').isLength({ min: 3 }).exists(),
  body('father', 'Father Name should be at least 3 characters').isLength({ min: 3 }).exists(),
  body('rollNo', 'Invalid Roll Number format').custom((value) => {
    const rollNoPattern = /^[0-9]{4}-BSCS-[0-9]{2}$/;
    if (!rollNoPattern.test(value)) {
      throw new Error('Invalid Roll Number format');
    }
    return true;
  }),
  body('department', 'Department cannot be left blank').exists(),
  body('batch', 'Batch cannot be left blank').exists(),
  body('cnic', 'CNIC cannot be left blank').exists(),
  body('semester', 'Semester cannot be left blank').exists(),
  body('email', 'Invalid email').isEmail(),
], async (req, res) => {
  const { name, father, rollNo, batch, cnic, semester, department, email } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check if email already exists
    const existingEmail = await User.findOne({ email: email });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: "Email should be unique." });
    }

    // Check if roll number (rollNo) already exists
    const existingRollNo = await User.findOne({ rollNo: rollNo });
    if (existingRollNo) {
      return res.status(400).json({ success: false, message: "Roll No. should be unique." });
    }

    // Check if CNIC already exists
    const existingCnic = await User.findOne({ cnic: cnic });
    if (existingCnic) {
      return res.status(400).json({ success: false, message: "CNIC should be unique." });
    }

    // Hash the CNIC for storing in the database
    const salt = await bcrypt.genSalt(10);
    const hashedCnic = await bcrypt.hash(cnic, salt);

    // Create a new user with the provided details
    const newUser = new User({
      name, father, rollNo, batch, cnic, password: hashedCnic, semester, department, email
    });

    // Save the new user to the database
    await newUser.save();

    // Generate JWT token for the new user
    const data = {
      user: {
        id: newUser.id
      }
    };
    const token = jwt.sign(data, JWT_KEY);

    // Return success message and token
    res.json({ success: true, token, message: 'Registration successful' });
  } catch (err) {
    console.error('error in registration: ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Password reset route
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        return res.send({ success: false, message: "User doesn't Exist" })
      }

      const token = jwt.sign({ id: user.id }, JWT_KEY, { expiresIn: '5m' });

      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'YOUR_EMAIL',
          pass: 'YOUR PASSKEY'
        }
      });

      var mailOptions = {
        from: 'YOUR_eMAIL',
        to: email,
        subject: 'Reset Password Link',
        html: `<h4>The Link will expire in 5m</h4> <br> <p><strong>Link:</strong> <a href="http://localhost:3000/studentMain/reset_password/${user._id}/${token}">http://localhost:3000/studentMain/reset_password/${user._id}/${token}</a></p>
        <p>The link will expire in 5 minutes.</p>`
      };
      // console.log('mailoption is')
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          return res.send({ success: true, message: "Check Your Email" })
        }
      });
    })
})

router.post('/reset-password/:id/:token', (req, res) => {
  const { id, token } = req.params
  const { password } = req.body

  jwt.verify(token, JWT_KEY, (err, decoded) => {
    if (err) {
      return res.json({ Status: 'Error with token' });
    } else {
      // Hash the new password synchronously

      bcrypt.genSalt(10)
        .then((salt) => bcrypt.hashSync(password, salt))
        .then((hash) => {
          // Update the user's password
          User.findByIdAndUpdate(id, { password: hash })
            .then((u) => {
              console.log('user ', u);
              res.send({ success: true, message: 'Password Updated Successfully' });
            })
            .catch((err) => {
              console.error('error in changing password', err);
              res.send({ success: false, message: 'Error in Changing Password' });
            });
        })
        .catch((err) => {
          console.error('error in changing password', err);
          res.send({ success: false, message: 'Error in Changing Password' });
        });
    }
  });

})

//delete Student
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const student = await User.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    console.log('student is ', student.name);

    // It will delete student data from all the groups and projectRequests 
    const group = await Group.findById(student.group);
    if (group) {
      for (const project of group.projects) {
        project.students = project.students.filter(stu => !stu.userId.equals(student._id));
        await project.save();

        const projectRequest = await ProjectRequest.findOne({ projectTitle: project.projectTitle });
        if (projectRequest) {
          projectRequest.students = projectRequest.students.filter(stu => !stu.equals(student._id));
          projectRequest.status = false;
          await projectRequest.save();
        }
      }

      // Notify supervisor that their student is deleted
      const supervisor = await Supervisor.findById(group.supervisorId);
      if (supervisor) {
        supervisor.unseenNotifications.push({ type: "Important", message: `Committee deleted your group student ${student.name}` });
        await supervisor.save();
      }
    }

    const deletedMember = await User.findByIdAndDelete(id);

    if (!deletedMember) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting Student:', error);
    res.status(500).json({ message: 'Error deleting Student', error });
  }
});


//get all Supervisor
router.get('/get-students', async (req, res) => {

  try {
    const members = await User.find();
    res.json({ success: true, members })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }

});


// Password reset route
router.post('/reset-password', async (req, res) => {
  const { username, newPassword } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ rollNo: username });

    // Check if user exists
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'youremail@gmail.com',
        pass: 'yourpassword'
      }
    });

    var mailOptions = {
      from: 'youremail@gmail.com',
      to: 'myfriend@yahoo.com',
      subject: 'Password Updated',
      text: 'Password updates successfully!'
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(newPassword, salt);
    user.password = secPass;
    await user.save();
    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


// User sends a project request to a supervisor
router.post('/send-project-request', authenticateUser, async (req, res) => {
  const { username, projectTitle, description, scope } = req.body;

  try {
    // Find the user who is making the request
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // check if user is already in a group ed
    if (user.isMember) {
      user.pendingRequests = [];
      await user.save()
      return res.status(500).json({ success: false, message: 'You are already in a group' });
    }

    // Find the supervisor by username
    const supervisor = await Supervisor.findOne({ username });
    if (!supervisor) {
      return res.status(404).json({ success: false, message: 'Supervisor not found' });
    }
    if (supervisor.slots <= 0) {
      return res.status(500).json({ success: false, message: 'Supervisor Slots Are full' });
    }

    // check if supervisor has rejected his request before
    const rejectedRequests = user.rejectedRequest.filter(request => {
      return request.equals(supervisor._id)
    });
    console.log('rejected request is ', rejectedRequests)
    console.log('rejected request is ', rejectedRequests.length)
    if (rejectedRequests.length > 0) {
      return res.status(500).json({ success: false, message: "You cannot send request to this supervisor as he rejected your request before." });
    }

    // Check if the user has already sent a request to this supervisor
    const requestExists = user.pendingRequests.filter(req => {
      return req.equals(supervisor._id)
    });
    console.log('requestExists ', requestExists)
    console.log('requestExists ', requestExists.length)

    if (requestExists.length > 0) {
      return res.status(400).json({ success: false, message: 'Request already sent to this supervisor' });
    }

    const pendingProject = await ProjectRequest.findOne({ projectTitle: projectTitle });
    if (!pendingProject) {
      // Create a new project request and add it to the user's pendingRequests
      const projectRequest = new ProjectRequest({
        projectTitle, description,
        scope, status: false
      });
      user.pendingRequests.push(supervisor._id);
      user.unseenNotifications.push({ type: "Important", message: `Project request sent to ${supervisor.name}` });

      // console.log('project id is ', projectRequest._id, 'type is ', typeof (projectRequest._id))
      // console.log('user id is ', user._id, 'type is ', typeof (user._id))

      supervisor.projectRequest.push({
        isAccepted: false,
        project: projectRequest._id,
        user: user._id
      })
      supervisor.unseenNotifications.push({ type: "Important", message: `A new proposal for ${projectTitle}` });

      await Promise.all([user.save(), supervisor.save(), projectRequest.save()]);

      return res.json({ success: true, message: `Project request sent to ${supervisor.name}` });

    } else {
      return res.status(500).json({ success: false, message: "Request with this project Title Already exist" });
    }

  } catch (err) {
    console.error('Error sending project request:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


//get my detail
router.get('/detail', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id; // Get the authenticated user's ID from the token payload

    const member = await User.findById(userId);

    if (!member) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Return the student details
    return res.json({ success: true, member, user: userId });
  } catch (error) {
    console.error('error is ', error)
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/request-to-join/:projectTitle', authenticateUser, async (req, res) => {
  const { projectTitle } = req.params;

  try {
    const student = await User.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (student.isMember) {
      return res.status(500).json({ success: false, message: `You're already in a Group` });
    }

    const projectRequest = await ProjectRequest.findOne({ projectTitle: projectTitle });
    if (!projectRequest) {
      return res.status(404).json({ success: false, message: 'Project Request not found' });
    }

    // console.log('project request in sending request is ', projectRequest.supervisor)
    const supervisor = await Supervisor.findById(projectRequest.supervisor);
    if (!supervisor) {
      return res.status(404).json({ success: false, message: 'Supervisors not found' });
    }

    // check if supervisor has rejected his request before
    const rejectedRequests = student.rejectedRequest.filter(request => {
      return request.equals(supervisor._id)
    });
    if (rejectedRequests.length > 0) {
      return res.status(500).json({ success: false, message: "You cannot send request to this supervisor as he rejected your request before." });
    }

    // Check if the group is already filled
    if (projectRequest.students.status) {
      return res.status(400).json({ success: false, message: 'Student The Group is already filled' });
    }

    // Check if a user has already sent a request for this group
    const hasSentRequest = student.pendingRequests.filter((request) => {
      return request.equals(supervisor._id)
    });
    console.log('request is ', hasSentRequest)
    console.log('request is ', hasSentRequest.length)

    if (hasSentRequest.length > 0) {
      return res.status(500).json({ success: false, message: `You've Already sent Request To this Supervisor` });
    }

    const notificationMessage = `${student.name} has requested to join the group: ${projectRequest.projectTitle}`;
    supervisor.unseenNotifications.push({ type: 'Important', message: notificationMessage });
    supervisor.projectRequest.push({
      project: projectRequest._id,
      user: student._id
    });
    student.pendingRequests.push(supervisor._id);
    student.unseenNotifications.push({ type: 'Important', message: `You've sent a request to ${supervisor.name} to join group ${projectRequest.projectTitle}` })
    await Promise.all([supervisor.save(), student.save()]);

    res.json({ success: true, message: `Request sent to ${supervisor.name} for ${projectRequest.projectTitle}` });
  } catch (err) {
    console.error('Error sending join request:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// route to edit
router.put('/edit/:id', async (req, res) => {
  const studentId = req.params.id;
  const updatedDetails = req.body;
  const updatedEmail = updatedDetails.email;
  const updatedRollNo = updatedDetails.rollNo;
  const updatedCnic = updatedDetails.cnic;

  try {
    // Check if the updated email, rollNo, or cnic already exists for another student
    const existingEmail = await User.findOne({ email: updatedEmail });
    const existingRollNo = await User.findOne({ rollNo: updatedRollNo });
    const existingCnic = await User.findOne({ cnic: updatedCnic });

    if (existingEmail && existingEmail._id.toString() !== studentId) {
      return res.status(400).json({ success: false, message: "Email already exists for another student." });
    }

    if (existingRollNo && existingRollNo._id.toString() !== studentId) {
      return res.status(400).json({ success: false, message: "Roll No. already exists for another student." });
    }

    if (existingCnic && existingCnic._id.toString() !== studentId) {
      return res.status(400).json({ success: false, message: "CNIC already exists for another student." });
    }

    // Update student details
    const updatedStudent = await User.findByIdAndUpdate(studentId, updatedDetails, { new: true });

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Logic to update student details in related group
    const student = await User.findById(studentId);
    if (student && student.group) {
      const group = await Group.findById(student.group);
      if (group) {
        group.projects.forEach(proj => {
          proj.students.forEach(stu => {
            if (stu.userId.equals(studentId)) {
              stu.name = updatedDetails.name; // Update the name
              stu.rollNo = updatedDetails.rollNo; // Update the rollNo
            }
          });
        });
        await group.save();
      }
    }

    return res.status(200).json({ success: true, message: "Edited Successfully" });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});




router.get('/my-group', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const student = await User.findById(userId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student Not Found' });
    }
    const group = await Group.findById(student.group);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group Not Found' });
    }
    const viva = await Viva.findById(student.viva);
    const groupDetail = {
      myDetail: [{
        name: student.name,
        rollNo: student.rollNo,
        myId: student._id
      }],
      groupId: student.group, supervisor: group.supervisor,
      supervisorId: group.supervisorId, projectTitle: group.projects[0].projectTitle,
      projectId: group.projects[0].projectId,
      groupMember: group.projects[0].students.filter(stu => !stu.userId.equals(userId)),
      proposal: group.proposal, documentation: group.documentation,
      docDate: group.docDate, propDate: group.propDate,
      propSub: group.propSub, docSub: group.docSub, vivaDate: group.vivaDate,
      viva: viva, meetingReport: group.meetingReport,
      meetings: group.meetings,
      instructions: group.instructions, purpose: group.meetingPurpose,
      docs: group.docs, proposalLink: group.proposalLink, documentationLink: group.documentationLink,
      externalMarks: group.externalMarks,
      marks: group.marks, hodMarks: group.hodMarks,
      meetingDate: group.meetingDate,
      meetingLink: group.meetingLink ? group.meetingLink : "",
      meetingTime: group.meetingTime,
      meetingId: group.meetingid, isViva: group.isViva
    }
    return res.json({ success: true, group: groupDetail })
  } catch (error) {
    console.error(`error fetching group`, error);
    res.json({ message: `Internal Server error ${error}` })
  }
});

router.get('/notification', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Student not found' });
    }
    const notification = user.unseenNotifications;
    return res.json({ success: true, notification })
  } catch (error) {
    console.error('error is ', error);
    return res.status(500).json({ message: 'Server error' });
  }
});


// Mark a notification as seen
router.post('/mark-notification-seen/:notificationIndex', authenticateUser, async (req, res) => {
  const userId = req.user.id; // Get the user ID from the authenticated user
  const notificationIndex = req.params; // Assuming you send the notification index in the request body

  try {
    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the notification index is within the bounds of 'unseenNotifications'
    if (notificationIndex < 0 || notificationIndex >= user.unseenNotifications.length) {
      return res.status(404).json({ message: 'Invalid notification index' });
    }

    // Remove the notification from 'unseenNotifications' and push it to 'seenNotifications'
    const notification = user.unseenNotifications.splice(notificationIndex, 1)[0];
    console.log('notification is ', notification);
    user.seenNotifications.push(notification);

    // Save the updated user document
    await user.save();

    res.status(200).json({ message: 'Notification marked as seen' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/getRequests', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const requests = [];

    for (const reqId of user.requests) {
      const request = await ProjectRequest.findById(reqId);

      if (!request) {
        continue; // Skip requests that couldn't be found
      }

      const supervisor = await Supervisor.findById(request.supervisor);
      if (!supervisor) {
        continue; // Skip requests with supervisors that couldn't be found
      }
      requests.push({
        projectId: request._id,
        projectTitle: request.projectTitle,
        description: request.description,
        scope: request.scope,
        supervisorName: supervisor.name,
      });
    }

    res.json({ success: true, requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to accept, reject, or improve project requests
router.put('/process-request/:projectId/:action', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.isMember) {
      return res.status(500).json({ message: `You're Already in a Group` });
    }
    const { projectId, action } = req.params;
    const request = await ProjectRequest.findById(projectId);
    console.log('request is ', request);

    if (!request) {
      return res.status(404).json({ message: 'Project Request not found' });
    }

    const supervisor = await Supervisor.findById(request.supervisor);
    // console.log('supervisor is ', supervisor);

    // Remove the request from the student's request array
    const filterRequests = user.requests.filter(reqId => !reqId.equals(projectId));
    user.requests = filterRequests;
    await user.save();
    if (action === 'accept') {
      console.log('accape code starts');
      // Check if a group with the same title exists
      const existingGroup = await Group.findOne({ 'projects.projectTitle': request.projectTitle });

      if (existingGroup) {
        console.log('existing group is ', existingGroup.projects[0].students)
        console.log('existing group is ', existingGroup.projects[0].students.length)
        // Check if the group has fewer than 2 students
        if (existingGroup.projects[0].students.length < 2) {
          // Add student to the existing group
          existingGroup.projects[0].students.push({
            name: user.name,
            rollNo: user.rollNo,
            userId: user._id
          });

          // Update user properties
          user.group = existingGroup._id; user.isMember = true;
          user.pendingRequests = []; user.requests = [];
          user.unseenNotifications.push({
            type: "Important",
            message: `You're now in Group: ${existingGroup.projects[0].projectTitle}`
          })

          // Notify the supervisor

          if (supervisor) {
            console.log('if state ment is running');
            supervisor.unseenNotifications.push({
              type: 'Important',
              message: `${user.name} accepted your request to join ${request.projectTitle}'s group`
            });
            const filteredIdea = supervisor.myIdeas.filter(idea => {
              return !idea.projectId.equals(request._id);
            })
            supervisor.myIdeas = filteredIdea;
            await supervisor.save();
          }
          request.students.push(user._id)
          if (request.students.length === 2) {
            request.status = true;
          }
          request.markModified('students');
          await request.save();
          await Promise.all([existingGroup.save(), user.save(), request.save()]);
          return res.json({ success: true, message: 'Student added to the existing group' });
        } else {
          return res.json({ success: false, message: "Group is Already Filled." });
        }
      }
      // if supervisor slots are full and no group is created then return
      if (supervisor.slots <= 0) {
        return res.json({ success: false, message: "Superisor's Slots Are Full So Look For Another Supervisor" })
      }

      // If no existing group or group is full, create a new group
      const newGroup = new Group({
        supervisor: supervisor.name,
        supervisorId: supervisor._id,
        projects: [{
          projectTitle: request.projectTitle,
          students: [{
            name: user.name,
            rollNo: user.rollNo,
            userId: user._id
          }]
        }],
      });

      // Update user properties
      user.group = newGroup._id;
      user.requests = [];
      user.pendingRequests = [];
      user.isMember = true;

      // Notify the supervisor
      if (supervisor) {
        supervisor.unseenNotifications.push({
          type: 'Important',
          message: `${user.name} accepted your request to join ${request.projectTitle}'s group`
        });
        const filteredIdea = supervisor.myIdeas.filter(idea => {
          return !idea.projectId.equals(request._id);
        })
        supervisor.myIdeas = filteredIdea;
        supervisor.groups.push(newGroup._id);
        supervisor.slots = supervisor.slots - 1;
        if (supervisor.slots <= 0) {
          supervisor.myIdeas.forEach(async (ideas) => {
            const idea = await ProjectRequest.findById(ideas.projectId);
            if (idea) {
              idea.active = false;
              await idea.save();
            }
          })
        }
        await supervisor.save();
      }
      request.students.push(user._id)
      if (request.students.length === 2) {
        request.status = true;
      }
      request.markModified('students');

      await Promise.all([newGroup.save(), user.save(), await request.save()]);
      return res.json({ success: true, message: 'Student added to a new group' });
    } else if (action === 'reject') {
      console.log('reject statement starts')
      // Notify the supervisor about rejection
      const supervisor = await Supervisor.findById(request.supervisor);
      if (supervisor) {
        supervisor.unseenNotifications.push({
          type: 'Important',
          message: `${user.name} rejected your request to join ${request.projectTitle}'s group`
        });
        await supervisor.save();
      }

      return res.json({ success: true, message: 'Request rejected successfully' });
    } else if (action === 'improve') {
      // Update project request details
      const { projectTitle, scope, description } = req.body;

      // Check if a group with the same title exists
      const existingGroup = await Group.findOne({ 'projects.projectTitle': request.projectTitle });

      if (existingGroup) {
        // Check if the group has fewer than 2 students
        if (existingGroup.projects[0].students.length < 2) {
          // Add student to the existing group
          existingGroup.projects[0].students.push({
            name: user.name,
            rollNo: user.rollNo,
            userId: user._id
          });
          existingGroup.projects[0].projectTitle = projectTitle;
          // Update user properties
          user.group = existingGroup._id;
          user.requests = [];
          user.pendingRequests = [];
          user.isMember = true;

          // Notify the supervisor
          const supervisor = await Supervisor.findById(request.supervisor);
          if (supervisor) {
            supervisor.unseenNotifications.push({
              type: 'Important',
              message: `${user.name} improved and accepted your request to join ${request.projectTitle}'s group`
            });
            const filteredIdea = supervisor.myIdeas.filter(idea => {
              return !idea.projectId.equals(request._id);
            })
            supervisor.myIdeas = filteredIdea;
            await supervisor.save();
          }
          request.students.push(user._id);
          if (request.students.length === 2) {
            request.status = true;
          }

          if (projectTitle) request.projectTitle = projectTitle;
          if (scope) request.scope = scope;
          if (description) request.description = description;

          await Promise.all([existingGroup.save(), user.save(), request.save()]);
          return res.json({ success: true, message: 'Student added to the existing group after improving the request' });
        }
      }
      // if slots are full and new group is to be formed then do this
      if (supervisor.slots <= 0) {
        return res.json({ success: false, message: "Superisor's Slots Are Full So Look For Another Supervisor" })
      }

      // If no existing group or group is full, create a new group
      const newGroup = new Group({
        projects: [{
          projectTitle: projectTitle,
          students: [{
            name: user.name,
            rollNo: user.rollNo,
            userId: user._id
          }]
        }],
        supervisorId: request.supervisor,
        supervisor: supervisor.name,
      });

      // Update user properties
      user.group = newGroup._id;
      user.requests = [];
      user.pendingRequests = [];
      user.isMember = true;

      // Notify the supervisor
      if (supervisor) {
        supervisor.unseenNotifications.push({
          type: 'Important',
          message: `${user.name} improved and accepted your request to join ${request.projectTitle}'s group`
        });
        const filteredIdea = supervisor.myIdeas.filter(idea => {
          return !idea.projectId.equals(request);
        })
        supervisor.myIdeas = filteredIdea;
        supervisor.slots = supervisor.slots - 1;
        if (supervisor.slots <= 0) {
          supervisor.myIdeas.forEach(async (ideas) => {
            const idea = await ProjectRequest.findById(ideas.projectId);
            if (idea) {
              idea.active = false;
              await idea.save();
            }
          })
        }
        await supervisor.save();
      }

      await Promise.all([newGroup.save(), user.save()]);
      return res.json({ success: true, message: 'Student added to a new group after improving the request' });
    }

    res.status(400).json({ success: false, message: 'Invalid action' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/request-meeting', authenticateUser, async (req, res) => {
  try {
    const student = await User.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student Not found' });
    }
    const group = await Group.findById(student.group);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group Not found' });
    }
    const supervisor = await Supervisor.findById(group.supervisorId);
    if (!supervisor) {
      return res.status(404).json({ success: false, message: 'Supervisor Not found' });
    }
    const project = group.projects[0].projectTitle;
    supervisor.unseenNotifications.push({
      type: "Important",
      message: `${student.name} has requested a meeting with you for group ${project}`,
    });
    group.projects[0].students.map(async stu => {
      let s = await User.findById(stu.userId);
      s.unseenNotifications.push({ type: "Important", message: `Request sent to supervisor for meeting on ${new Date().toLocaleDateString('en-GB')}` });
      await s.save();
    })
    await supervisor.save();
    return res.json({ success: true, message: "Request sent to supervisor for meeting" });

  } catch (error) {
    console.error('error sending meeting request', error);
    return res.json({ message: "Internal Server Error" });
  }
});

//Request Supervisor for date Extension
router.post('/extension', authenticateUser, async (req, res) => {
  try {
    const { reason } = req.body;
    const student = await User.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student Not found' });
    }

    const group = await Group.findById(student.group);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group Not found' });
    }

    if (!group.docDate) {
      return res.status(500).json({ success: false, message: 'Extension is acceptable only for Documentation' });
    }

    if (group.documentation) {
      return res.status(500).json({ success: false, message: `You've already submitted documentation` });
    }

    if (new Date(group.docDate) < new Date()) {
      return res.json({ success: false, message: "You cannot send extension request documentation deadline has been passed" })
    }

    if (group.extensionRequest.length > 0) {
      return res.status(404).json({ success: false, message: 'You can only send request once' });
    }

    const supervisor = await Supervisor.findById(group.supervisorId);
    if (!supervisor) {
      return res.status(404).json({ success: false, message: 'Supervisor Not found' });
    }

    // Check if the request type already exists in the supervisor's extension requests
    const isRequestExists = supervisor.extensionRequest.some(request => {
      return request.group === group.projects[0].projectTitle
    });

    if (isRequestExists) {
      return res.json({ success: false, message: `Request Already sent for Extension` });
    }

    group.extensionRequest.push({
      student: student.name,
      reason: reason
    });
    console.log('group', group.extensionRequest)

    group.projects[0].students.map(async stu => {
      const studentObj = await User.findById(stu.userId);
      studentObj.unseenNotifications.push({
        type: "Important", message: `Extension Request sent to Supervisor on ${new Date().toLocaleDateString()}`

      });
      await studentObj.save()
    })

    await group.save();
    const requestId = group.extensionRequest[group.extensionRequest.length - 1]._id;
    console.log('request Id', requestId)
    supervisor.extensionRequest.push({
      student: student.name,
      group: group.projects[0].projectTitle,
      requestId: requestId,
      reason: reason
    });

    supervisor.unseenNotifications.push({
      type: "Important",
      message: `Request for extension by group: ${group.projects[0].projectTitle}`
    });

    await supervisor.save();

    return res.json({ success: true, message: "Extension request sent successfully" });
  } catch (error) {
    console.error('error in sending extension request', error);
    return res.json({ success: false, message: "Internal Server Error" });
  }
});

// Route to get all students' rollNo and filter those who are not members
router.get('/rollNo', async (req, res) => {
  try {
    const students = await User.find({ isMember: false }, 'rollNo'); // Retrieve students with isMember set to false, and only select rollNo field
    const rollNumbers = students.map(student => student.rollNo); // Extract rollNo from the filtered students
    res.status(200).json(rollNumbers); // Send the roll numbers in the response
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;