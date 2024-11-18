const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const externalSchema = new Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, unique: true },
    groups: [{
        id: { type: Schema.Types.ObjectId, ref: 'Group' },
        name: { type: String },
        date: { type: Date }
    }],
    department: { type: String },
    designation: { type: String },
});

module.exports = mongoose.model('External', externalSchema);