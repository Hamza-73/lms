const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
    fname: { type: String },
    superAdmin: { type: Boolean },
    lname: { type: String },
    username: { type: String, required: true, unique: true, minlength: 4 },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 4 },
    requests: [{
        userId: { type: Schema.Types.ObjectId, ref: 'Student' },
        name: { type: String },
        rollNo: { type: String }
    }],
});

module.exports = mongoose.model('Admin', adminSchema);