const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectRequestSchema = new Schema({
  supervisor: { type: Schema.Types.ObjectId, ref: 'Supervisor' },
  students: [{ type: Schema.Types.ObjectId, ref: 'User',}],
  projectTitle: { type: String, required: true },
  description: { type: String, required: true },
  scope: { type: String, required: true },
  status:{ type : Boolean, default:false, required:true },
  active: { type : Boolean, default:true, required:true }
});

module.exports = mongoose.model('ProjectRequest', projectRequestSchema);