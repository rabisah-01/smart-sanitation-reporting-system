const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');
const User = require('../models/User');

const getSummary = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [statusCounts, categoryCounts, recentComplaintsRaw, avgResolutionAgg, monthlyTrendAgg] =
      await Promise.all([
        Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        Complaint.aggregate([
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        Complaint.find()
          .populate('user_id', 'name')
          .sort({ date: -1 })
          .limit(5),
        Complaint.aggregate([
          { $match: { status: 'resolved' } },
          {
            $project: {
              hours: { $divide: [{ $subtract: ['$updated_at', '$date'] }, 1000 * 60 * 60] },
            },
          },
          { $group: { _id: null, avg_hours: { $avg: '$hours' } } },
        ]),
        Complaint.aggregate([
          { $match: { date: { $gte: sixMonthsAgo } } },
          {
            $group: {
              _id: { year: { $year: '$date' }, month: { $month: '$date' } },
              count: { $sum: 1 },
            },
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]),
      ]);

    const statusMap = {};
    statusCounts.forEach((r) => {
      statusMap[r._id] = r.count;
    });
    const total = Object.values(statusMap).reduce((a, b) => a + b, 0);

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    res.json({
      total,
      pending: statusMap.pending || 0,
      assigned: statusMap.assigned || 0,
      in_progress: statusMap.in_progress || 0,
      resolved: statusMap.resolved || 0,
      rejected: statusMap.rejected || 0,
      resolutionRate: total > 0 ? Math.round(((statusMap.resolved || 0) / total) * 100) : 0,
      avgResolutionHours: avgResolutionAgg[0]
        ? Math.round(avgResolutionAgg[0].avg_hours * 10) / 10
        : 0,
      categoryBreakdown: categoryCounts.map((r) => ({ category: r._id, count: r.count })),
      recentComplaints: recentComplaintsRaw.map((c) => c.toJSON()),
      monthlyTrend: monthlyTrendAgg.map((r) => ({
        month: `${monthNames[r._id.month - 1]} ${r._id.year}`,
        count: r.count,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAdminStats = async (req, res) => {
  try {
    const admins = await User.aggregate([
      { $match: { role: 'admin' } },
      {
        $lookup: {
          from: 'complaints',
          let: { adminId: '$_id' },
          pipeline: [{ $match: { $expr: { $eq: ['$assignment.admin_id', '$$adminId'] } } }],
          as: 'assignedComplaints',
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          assigned: { $size: '$assignedComplaints' },
          resolved: {
            $size: {
              $filter: {
                input: '$assignedComplaints',
                as: 'c',
                cond: { $eq: ['$$c.status', 'resolved'] },
              },
            },
          },
        },
      },
      { $sort: { resolved: -1 } },
    ]);

    res.json({
      admins: admins.map((a) => ({ name: a.name, email: a.email, assigned: a.assigned, resolved: a.resolved })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getSummary, getAdminStats };
