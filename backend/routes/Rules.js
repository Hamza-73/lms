const express = require('express');
const router = express.Router();
const SharedRules = require('../models/SharedRules');

// Route to add a new role and rules
router.post('/add-role', async (req, res) => {
    try {
        const { role, rules } = req.body;

        // Check if the role already exists
        const existingRole = await SharedRules.findOne({ 'rule.role': role });

        if (existingRole) {;
            return res.json({ success: false, message: `Rules for ${role} already exists` });
        } else {
            const newRole = role.toLowerCase();
            // If the role doesn't exist, create a new document
            await SharedRules.create({ rule: [{ role, rules }] });
            res.json({ success: true, message: 'Role and rules added successfully' });
        }
    } catch (error) {
        console.error('Error adding new role and rules:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.get('/get-all-roles', async (req, res) => {
    try {
        const allRoles = await SharedRules.find({}, 'rule.role rule.rules');

        // Extract role and rules data from the documents
        const rolesWithRules = allRoles.map((doc) => ({
            role: doc.rule[0].role,
            rules: doc.rule[0].rules,
        }));

        res.json({ success: true, roles: rolesWithRules });
    } catch (error) {
        console.error('Error fetching all roles and rules:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// Route to get only roles
router.get('/get-roles', async (req, res) => {
    try {
        const allRoles = await SharedRules.find({}, 'rule.role');

        // Extract role names from the documents
        const roles = allRoles.map((doc) => doc.rule[0].role);

        res.json({ success: true, roles: roles });
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// Route to get rules for a specific role
router.get('/get-rules/:role', async (req, res) => {
    try {
        const roleParam = req.params.role;
        const roleData = await SharedRules.findOne({ 'rule.role': roleParam });

        if (!roleData) {
            return res.status(404).json({ success: false, error: 'Role not found' });
        }

        const rules = roleData.rule[0].rules;
        res.json({ success: true, rules: rules });
    } catch (error) {
        console.error('Error fetching rules for the role:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// Route to edit rules for a specific role
router.put('/edit-rules/:role', async (req, res) => {
    try {
        const roleParam = req.params.role;
        const updatedRules = req.body.rules;

        const roleData = await SharedRules.findOne({ 'rule.role': roleParam });

        if (!roleData) {
            return res.status(404).json({ success: false, error: 'Role not found' });
        }

        // Update the rules for the specific role
        roleData.rule[0].rules = updatedRules;
        await roleData.save();

        res.json({ success: true, message: 'Rules updated successfully' });
    } catch (error) {
        console.error('Error editing rules for the role:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.delete('/delete-rule/:role', async (req, res) => {
    try {
        const { role } = req.params;
        const rule = await SharedRules.findOneAndDelete({ 'rule.role': role });
        if (!rule) {
            return res.json({ success: false, message: "Rule Not Found" });
        }
        return res.json({ success: true, message: "deleted Successfully" })
    } catch (error) {
        console.error('error in deleting rule', error);
    }
})

module.exports = router;