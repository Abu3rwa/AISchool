const mongoose = require('mongoose');
const { Schema } = mongoose;

const providerSchema = new Schema({
  name: { type: String, required: true },          // e.g. EduCloud
  legalName: String,
  email: String,
  domain: String,
  isActive: { type: Boolean, default: true },
  deleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Provider', providerSchema);