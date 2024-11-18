const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const supervisorSchema = new Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, unique: true },
  designation: { type: String, required: true },
  department: { type: String, required: true },
  slots: { type: Number, required: true },
  password: { type: String, required: true },
  groups: [{ type: Schema.Types.ObjectId, ref: 'Group' }], // Store group IDs here
  projectRequest: [
    {
      isAccepted: { type: Boolean, default: false },
      project: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectRequest' },
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }
  ],
  seenNotifications: { type: Array, default: [] },
  unseenNotifications: { type: Array, default: [] },
  myIdeas: [{
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectRequest' },
    date: { type: Date },
    time: { type: String }
  }],

  meeting: [{ type: Schema.Types.ObjectId, ref: 'Meeting' }],
  login: { type: Number, default: 0 },
  isLogin: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  isCommittee: { type: Boolean, default: false },
  extensionRequest: [{
    isresponded: { type: Boolean, default: false },
    student: { type: String },
    reason: { type: String },
    group: { type: String },
    requestId: { type: Schema.Types.ObjectId }
  }],
  requests: [{
    group: { type: String },
    supervisor: { type: String },
    reason: { type: String }
  }],
  vivas: [{
    id: { type: Schema.Types.ObjectId, ref: 'Group' },
    name: { type: String },
    date: { type: Date }
  }],
  vivaHistory: [{
    date: { type: Date },
    type: { type: String },
    time: { type: String }
  }],
  propDate: { type: Date },
  docDate: { type: Date },
});

module.exports = mongoose.model('Supervisor', supervisorSchema);