const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['citizen', 'admin'], default: 'citizen' },
    // Only meaningful when role === 'admin' (replaces the old separate "admins" table)
    department: { type: String, default: 'Sanitation Department' },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

// Shape the JSON output like the old SQL rows so the frontend needs no changes
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.user_id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
