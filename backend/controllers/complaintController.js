const Complaint = require('../models/Complaint');
const User = require('../models/User');

const getComplaints = async (req, res) => {
  try {
    const { status, category, priority, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (req.user.role !== 'admin') filter.user_id = req.user.user_id;
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .populate('user_id', 'name email')
        .populate('assignment.admin_id', 'name')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limitNum),
      Complaint.countDocuments(filter),
    ]);

    res.json({
      complaints: complaints.map((c) => c.toJSON()),
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id)
      .populate('user_id', 'name email')
      .populate('assignment.admin_id', 'name');
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    const ownerId = complaint.user_id._id ? complaint.user_id._id.toString() : complaint.user_id.toString();
    if (req.user.role !== 'admin' && ownerId !== req.user.user_id)
      return res.status(403).json({ message: 'Access denied' });

    res.json(complaint.toJSON());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createComplaint = async (req, res) => {
  const { description, location, category, priority } = req.body;
  if (!description || !location || !category)
    return res.status(400).json({ message: 'Description, location, and category are required' });
  try {
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    const complaint = await Complaint.create({
      user_id: req.user.user_id,
      description,
      location,
      category,
      priority: priority || 'medium',
      image_url,
    });
    res.status(201).json(complaint.toJSON());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const valid = ['pending', 'assigned', 'in_progress', 'resolved', 'rejected'];
  if (!valid.includes(status)) return res.status(400).json({ message: 'Invalid status' });
  try {
    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { status, updated_at: new Date() },
      { new: true }
    )
      .populate('user_id', 'name email')
      .populate('assignment.admin_id', 'name');
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json(complaint.toJSON());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const assignComplaint = async (req, res) => {
  const { id } = req.params;
  const { assigned_to, notes } = req.body;
  if (!assigned_to) return res.status(400).json({ message: 'assigned_to is required' });
  try {
    const admin = await User.findOne({ _id: req.user.user_id, role: 'admin' });
    if (!admin) return res.status(403).json({ message: 'Admin record not found' });

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      {
        assignment: { assigned_to, notes: notes || null, admin_id: admin._id, assigned_at: new Date() },
        status: 'assigned',
        updated_at: new Date(),
      },
      { new: true }
    )
      .populate('user_id', 'name email')
      .populate('assignment.admin_id', 'name');
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.status(201).json(complaint.toJSON());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteComplaint = async (req, res) => {
  const { id } = req.params;
  try {
    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ message: 'Not found' });
    if (req.user.role !== 'admin' && complaint.user_id.toString() !== req.user.user_id)
      return res.status(403).json({ message: 'Access denied' });
    await complaint.deleteOne();
    res.json({ message: 'Complaint deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getComplaints, getComplaintById, createComplaint, updateStatus, assignComplaint, deleteComplaint };
