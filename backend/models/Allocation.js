const mongoose = require('mongoose');

const allocationSchema = new mongoose.Schema({
    date: { type: String, },
    time: { type: String },
    previousSupervisor: [{
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'Supervisor', required: true },
        name: { type: String, required: true }
    }],
    newSupervisor: [{
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'Supervisor', required: true },
        name: { type: String, required: true }
    }],
    groupName: { type: String, required: true, },
});

const Allocation = mongoose.model('Allocation', allocationSchema);

module.exports = Allocation;