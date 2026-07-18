const mongoose = require('mongoose');

// Embedded sub-document — replaces the old standalone "assignments" table.
// A complaint has at most one active assignment, so embedding avoids an extra collection/join.
const assignmentSchema = new mongoose.Schema(
  {
    assigned_to: { type: String, required: true }, // worker/team name
    notes: { type: String, default: null },
    admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assigned_at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['garbage', 'drainage', 'public_space', 'water', 'other'],
      default: 'garbage',
    },
    image_url: { type: String, default: null },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'in_progress', 'resolved', 'rejected'],
      default: 'pending',
    },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    date: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    assignment: { type: assignmentSchema, default: null },
  },
  { versionKey: false, id: false }
);

complaintSchema.index({ user_id: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ category: 1 });

// Flatten the shape to match the old SQL join result (c.*, citizen_name, assigned_to, ...)
complaintSchema.set('toJSON', {
  virtuals: false,
  transform: (doc, ret) => {
    ret.complaint_id = ret._id.toString();
    delete ret._id;
    delete ret.id;

    // user_id may be populated (object) or a plain ObjectId
    if (ret.user_id && typeof ret.user_id === 'object' && ret.user_id.name) {
      ret.citizen_name = ret.user_id.name;
      ret.citizen_email = ret.user_id.email;
      ret.user_id = ret.user_id.user_id || ret.user_id._id?.toString();
    } else if (ret.user_id) {
      ret.user_id = ret.user_id.toString();
    }

    if (ret.assignment) {
      ret.assigned_to = ret.assignment.assigned_to;
      ret.assignment_notes = ret.assignment.notes;
      ret.assigned_at = ret.assignment.assigned_at;
      if (ret.assignment.admin_id && typeof ret.assignment.admin_id === 'object') {
        ret.admin_name = ret.assignment.admin_id.name;
      }
    }
    delete ret.assignment;

    return ret;
  },
});

module.exports = mongoose.model('Complaint', complaintSchema);
