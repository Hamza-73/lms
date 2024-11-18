const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
JWT_KEY = 'hamzakhan1'
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin'); // Import the Admin model
const Committee = require('../models/Committee'); // Import the Admin model
const authenticateUser = require('../middleware/auth');
const User = require('../models/User');
const Supervisor = require('../models/Supervisor');
const nodemailer = require('nodemailer');

// Registration route for admins
router.post('/register', [
    body('username', 'Enter a valid username').isLength({ min: 3 }),
    body('fname', 'Enter a valid fname').isLength({ min: 3 }),
    body('lname', 'Enter a valid lname').isLength({ min: 3 }),
    body('email', 'Enter a valid email address').isEmail(),
    body('password', 'Password must be at least 4 characters').isLength({ min: 6 }),
], async (req, res) => {
    const { fname, lname, username, email, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const checkAdmin = await Admin.find();
        // Check if the updated username or email already exists for another student
        const existingStudent = await Admin.findOne(
            { email });

        if (existingStudent) {
            return res.status(400).json({ message: "Email already exists for another Admin" });
        }
        const existUsename = await Admin.findOne(
            { username: { $regex: new RegExp("^" + username.toLowerCase(), "i") } });
        if (existUsename) {
            return res.status(400).json({ message: "Username already exists for another Admin" });
        }

        const committee = await Committee.findOne({
            $or: [
                { username: { $regex: new RegExp("^" + username.toLowerCase(), "i") } },
                { email: email }
            ]
        });

        if (committee && committee.isAdmin) {
            return res.status(400).json({ success: false, message: "Username/Email Already Exist for the Co-Admin" });
        }

        const supervisor = await Supervisor.findOne({
            $or: [
                { username: { $regex: new RegExp("^" + username.toLowerCase(), "i") } },
                { email: email }
            ]
        });

        if (supervisor && supervisor.isAdmin) {
            return res.status(400).json({ success: false, message: "Username/Email Already Exist for the Co-Admin" });
        }
        else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create a new admin if the username and email are unique
            const newAdmin = new Admin({ fname, lname, username, email, password: hashedPassword });
            if (checkAdmin.length === 0 || !checkAdmin) {
                newAdmin.superAdmin = true;
            }
            await newAdmin.save();

            const data = {
                user: { id: newAdmin.id },
            };
            const token = jwt.sign(data, JWT_KEY);

            res.json({ success: true, token, message: 'Admin registration successful' });
        }
    } catch (err) {
        console.error('Error in admin registration', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


// Login route for admins
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the admin by username
        const admin = await Admin.findOne({ username });

        // Check if the user is an admin or a committee member with an "admin" role
        if (admin) {
            // If the user is an admin
            const isPasswordValid = await bcrypt.compare(password, admin.password);

            if (isPasswordValid) {
                // Generate JWT token for admin
                const token = jwt.sign({ id: admin.id, role: 'admin' }, JWT_KEY);

                res.json({ message: 'Admin login successful', success: true, token });
            } else {
                res.status(401).json({ success: false, message: 'Invalid username or password' });
            }
        } else {
            return res.json({ success: false, message: "User doesnot exist" });
        }
    } catch (err) {
        console.error('Error in admin login', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Password reset route
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    Admin.findOne({ email: email })
        .then(user => {
            if (!user) {
                return res.send({ success: false, message: "Supervisor doesn't exist" })
            }

            const token = jwt.sign({ id: user.id }, JWT_KEY, { expiresIn: '5m' });

            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'YOUR_EMAIL',
                    pass: 'YOUR_PASSWORD'
                }
            });

            var mailOptions = {
                from: 'YOUR_EMAIL',
                to: email,
                subject: 'Reset Password Link',
                html: `<h4>The Link will expire in 5m</h4> <br> <p><strong>Link:</strong> <a href="http://localhost:3000/adminMain/reset_password/${user._id}/${token}">http://localhost:3000/adminMain/reset_password/${user._id}/${token}</a></p>
        <p>The link will expire in 5 minutes.</p>`
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                    return res.send({ success: false, message: "Error Please check that your email is valid or not" })
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
            return res.json({ success: false, message: "Error with token" })
        } else {
            bcrypt.hash(password, 10)
                .then(hash => {
                    Admin.findByIdAndUpdate({ _id: id }, { password: hash })
                        .then(u => res.send({ success: true, message: "Password Updated Successfully" }))
                        .catch(err => { console.error('errror in changing password', err); res.send({ success: false, message: "Error in Changing Pasword" }) })
                })
                .catch(err => { console.error('errror in changing password', err); res.send({ success: false, message: "Error in Changing Pasword" }) })
        }
    })
})

// Route to make a committee member an admin
router.post('/make-admin', async (req, res) => {
    const { username } = req.body;
    console.log('username is', username)
    try {
        // Check if there is already a co-admin from committee or supervisor
        const existingCoAdmin = await Committee.findOne({ isAdmin: true })
            || await Supervisor.findOne({ isAdmin: true });

        if (existingCoAdmin) {
            return res.status(400).json({
                success: false,
                message: "There can only be 1 co-admin at a time. Please revoke the current co-admin status before making a new one."
            });
        }

        const admin = await Admin.findOne({ username: { $regex: new RegExp("^" + username.toLowerCase(), "i") } });
        if (admin) {
            return res.json({ success: false, message: "Admin with this username already exists/ change username and try again " });
        }

        // Find the committee member by username
        const committeeMember = await Committee.findOne({ username: { $regex: new RegExp("^" + username.toLowerCase(), "i") } });

        if (!committeeMember) {
            const supervisor = await Supervisor.findOne({ username: { $regex: new RegExp("^" + username.toLowerCase(), "i") } });
            if (!supervisor) {
                return res.status(404).json({ success: false, message: "Committee Member Not Found" });
            }
            if (!supervisor.isCommittee) {
                return res.status(404).json({ success: false, message: "Supervisor first needs to be a Committee Member to qualify for Co-Admin" });
            } if (supervisor.isAdmin) {
                return res.status(201).json({ success: true, message: "Supervisor is Already Admin" });
            } else {
                supervisor.isAdmin = true;
                await supervisor.save();
                return res.json({ message: 'Supervisor is now an admin', success: true });
            }
        }
        if (committeeMember.isAdmin) {
            return res.status(201).json({ success: true, message: "Committee Member is Already Admin" });
        }

        // Update the committee member's role to "admin"
        committeeMember.isAdmin = true;
        await committeeMember.save();

        res.json({ message: 'Committee member is now an admin', success: true });
    } catch (err) {
        console.error('Error making committee member an admin', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Route to make a committee member an admin
router.post('/make-committee', async (req, res) => {
    const { username } = req.body;
    try {
        // Find the committee member by username
        const committeeMember = await Supervisor.findOne({ username: { $regex: new RegExp("^" + username.toLowerCase(), "i") } });

        if (!committeeMember) {
            return res.status(404).json({ success: false, message: "Supervisor not found" });
        }
        const admin = await Committee.findOne({ username: { $regex: new RegExp("^" + username.toLowerCase(), "i") } });
        if (admin) {
            return res.json({ success: false, message: "Committe Member With The username already exists change the username" })
        }
        if (committeeMember.isCommittee) {
            return res.status(201).json({ success: true, message: "Supervisor is Already Committee Member" });
        }

        // Update the committee member's role to "admin"
        committeeMember.isCommittee = true;
        await committeeMember.save();

        return res.json({ supervisorId: committeeMember._id, success: true, message: "Supervisor is Now a Committee Member" });
    } catch (err) {
        console.error('Error making supervisor a committee member', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// get detail of admin
router.get('/detail', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id; // Get the authenticated user's ID from the token payload

        // Check if the user is an admin
        const admin = await Admin.findById(userId);

        if (admin) {
            let member = admin;
            // User is an admin, return admin details
            return res.json({ success: true, member });
        }

        // User is not an admin, check if they are a committee member
        const committeeMember = await Committee.findById(userId);

        if (committeeMember) {
            let member = committeeMember;
            // User is a committee member, return committee member details
            return res.json({ success: true, member });
        }

        // User not found
        return res.status(404).json({ message: 'Admin not found' });
    } catch (error) {
        console.error('Error in detail route:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

// Route to delete an admin by ID
router.delete('/delete/:id', authenticateUser, async (req, res) => {
    const { id } = req.params;

    try {
        const superAdmin = await Admin.findById(id);
        const admin = await Admin.findById(id);
        if (!admin) {
            const committee = await Committee.findById(id);
            if (committee) {
                committee.isAdmin = false;
                await committee.save();
                return res.json({ success: true, message: "Admin Deleted Successfully" });
            } if (!committee) {
                const supervisor = await Supervisor.findById(id);
                if (supervisor) {
                    supervisor.isAdmin = false;
                    await supervisor.save();
                    return res.json({ success: true, message: "Admin Deleted Successfully" });
                } else {
                    return res.json({ success: false, message: "Admin Not Found" })
                }
            }

        }
        if (superAdmin.superAdmin) {
            await Admin.findByIdAndDelete(id);
            res.json({ success: true, message: 'Admin deleted' });
        }
        if (admin.superAdmin) {
            return res.json({ success: false, message: "Only Super Admin can delete himself" })
        }
        await Admin.findByIdAndDelete(id);
        res.json({ success: true, message: 'Admin deleted' });
    } catch (error) {
        console.error('error is ', error)
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Route to edit an admin by ID
router.put('/edit/:id', authenticateUser, async (req, res) => {
    const { id } = req.params;
    const updatedDetail = req.body;

    try {
        const adminSuper = await Admin.findById(req.user.id);
        const adminToBeEdites = await Admin.findById(id);
        if (adminSuper) {
            if (!adminSuper.superAdmin && adminToBeEdites.superAdmin) {
                return res.json({ success: false, message: "Only Super Admin can edit himself" })
            }
        }
        // Check if the updated email already exists for another student
        const existingEmail = await Admin.findOne({ email: updatedDetail.email });
        if (existingEmail && existingEmail._id.toString() !== id) {
            return res.status(400).json({ message: "Email already exists for another Admin." });
        }
        // Check if the updated username already exists for another student
        const existingUsername = await Admin.findOne({ username: { $regex: new RegExp("^" + updatedDetail.username.toLowerCase(), "i") } });
        if (existingUsername && existingUsername._id.toString() !== id) {
            return res.status(400).json({ message: "Username already exists for another Admin." });
        }

        const committee = await Committee.findOne({
            $or: [
                { username: { $regex: new RegExp("^" + updatedDetail.username.toLowerCase(), "i") } },
                { email: updatedDetail.email }
            ]
        });

        if (committee && committee.isAdmin) {
            return res.status(400).json({ success: false, message: "Username/Email Already Exist for the Co-Admin" });
        }

        const supervisor = await Supervisor.findOne({
            $or: [
                { username: { $regex: new RegExp("^" + updatedDetail.username.toLowerCase(), "i") } },
                { email: updatedDetail.email }
            ]
        });

        if (supervisor && supervisor.isAdmin) {
            return res.status(400).json({ success: false, message: "Username/Email Already Exist for the Co-Admin" });
        }

        const updatedAdmin = await Admin.findByIdAndUpdate(id, updatedDetail, { new: true });

        if (!updatedAdmin) {
            return res.status(404).json({ success: false, message: `Admin not found/ check if it's Co-Admin` });
        }

        await updatedAdmin.save();
        return res.json({ success: true, message: "Edited Successfully" });
    } catch (error) {
        console.error('error is ', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});


// Route to get a list of all admins and committee members
router.get('/get-members', async (req, res) => {
    try {
        const allAdmins = await Admin.find();
        const committeeMembers = await Committee.find({ isAdmin: true });
        const supervisors = await Supervisor.find({ isAdmin: true })

        // Merge admin and committee members into the members array
        const members = [...allAdmins, ...committeeMembers, ...supervisors];

        if (members.length === 0) {
            res.status(404).json({ message: 'Members Not Found' });
        } else {
            res.json({ success: true, members });
        }
    } catch (error) {
        console.error('error is ', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


module.exports = router;  