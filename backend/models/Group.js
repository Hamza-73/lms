const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupSchema = new Schema({
  supervisor: { type: String, required: true },
  supervisorId: { type: Schema.Types.ObjectId, ref: 'Supervisor' },
  projects: [{
    projectTitle: { type: String, required: true, unique: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'ProjectRequest' },
    students: [{
      userId: { type: Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, required: true },
      rollNo: { type: String, required: true },
    }]
  }],
  remarks: { type: String },
  marks: { type: Number },
  externalMarks: { type: Number },
  hodMarks: { type: Number },
  proposal: { type: String },
  proposalLink: { type: String },
  documentationLink: { type: String },
  documentation: { type: String },
  viva: { type: Schema.Types.ObjectId, ref: 'Viva' },
  vivaDate: { type: Date },
  vivaTime: { type: String },
  propDate: { type: Date },
  propSub: { type: String },
  docDate: { type: Date },
  docSub: { type: String },
  meetingid: { type: Schema.Types.ObjectId, ref: 'Meeting' },
  meetingLink: { type: String },
  meetingDate: { type: Date },
  meetingTime: { type: String },
  meetingPurpose: { type: String },
  meetingReport: [{
    id: { type: Schema.Types.ObjectId, ref: 'Meeting' },
    date: { type: Date },
    review: { type: Boolean },
    value: { type: Number }
  }],
  meetings: [{
    date: { type: Date },
    review: { type: Boolean },
    value: { type: Number }
  }],
  docs: [{
    docLink: { type: String },
    review: { type: String },
    comment: { type: String },
    link: { type: String },
  }],
  instructions: { type: String },
  meeting: { type: Number, default: 0 },
  extensionRequest: [{
    isresponded: { type: Boolean, default: false },
    student: { type: String },
    reason: { type: String }
  }],
  external: { type: String },
  chairperson: { type: String },
  externalName: { type: String },
  isViva: { type: Boolean, default: false }
});

module.exports = mongoose.model('Group', groupSchema);