const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  rollNo: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, unique: true },
  father: { type: String, required: true },
  batch: { type: String, required: true },
  semester: { type: String, required: true },
  cnic: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  department: { type: String, required: true },
  token: { type: String },
  supervisor: { type: Schema.Types.ObjectId, ref: 'Supervisor' }, // Reference to the Supervisor model
  group: { type: Schema.Types.ObjectId, ref: 'Group' },
  pendingRequests: [{ type: Schema.Types.ObjectId, ref: 'Supervisor' }],
  seenNotifications: { type: Array, default: [], },
  unseenNotifications: { type: Array, default: [], },
  marks: { type: Number },
  externalMarks: { type: Number },
  internalMarks: { type: Number },
  hodMarks: { type: Number },
  isMember: { type: Boolean, default: false },
  propDate: { type: Date },
  docDate: { type: Date },
  docSub: { type: Date },
  propSub: { type: Date },
  viva: { type: Schema.Types.ObjectId, ref: 'Viva' },
  vivaDate: { type: String },
  vivaTime: {
    type: String,
    match: /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, // Validate as HH:mm format
  },
  isLogin : {type : Boolean, default:true},
  login: {type : Number , default : 0},
  meetingId: { type: Schema.Types.ObjectId, ref: 'Meeting' },
  meetingLink: { type: String },
  meetingTime: {
    type: String,
    match: /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, // Validate as HH:mm format
  },
  meetingDate: { type: Date },
  requests: { type: Array, default: [] },
  rejectedRequest: [{ type: Schema.Types.ObjectId, ref: 'Supervisor' }]
});

module.exports = mongoose.model('User', userSchema);