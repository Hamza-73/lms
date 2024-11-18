const mongoose = require('mongoose');

const sharedRulesSchema = new mongoose.Schema({
    rule: [
        {
            role: { type: String, required: true },
            rules: [{ type: String }],
        },
    ],
});

const SharedRules = mongoose.model('SharedRules', sharedRulesSchema);

module.exports = SharedRules;