const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const meetingSchema = new Schema({
  groupId: { type: Schema.Types.ObjectId, ref: 'Group' },
  supervisor : {type:String},
  projectTitle : {type:String },
  meetingLink:{type : String},
  purpose:{type : String},
  time: {
    type: String,
    match: /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, // Validate as HH:mm format
  },
  date:{type : Date},
  type : { type: String}
});

module.exports = mongoose.model('Meeting', meetingSchema);