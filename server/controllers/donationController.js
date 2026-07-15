import Donation from '../models/Donation.js';
import Member from '../models/Member.js';
import { io } from '../server.js';

export const getDonations = async (req, res) => {
  try {
    const { page = 1, limit = 10, donorId, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (donorId) query.donor = donorId;
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const [donations, total] = await Promise.all([
      Donation.find(query)
        .populate('donor', 'name photo')
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Donation.countDocuments(query),
    ]);

    // Calculate total amount
    const totalAmount = await Donation.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.json({
      data: donations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
      summary: {
        totalAmount: totalAmount[0]?.total || 0,
        totalDonations: total,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'name photo phone email');

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    res.json(donation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createDonation = async (req, res) => {
  try {
    const donationData = {
      ...req.body,
      createdBy: req.user?._id || null,
      updatedBy: req.user?._id || null,
    };

    const donation = new Donation(donationData);
    await donation.save();

    // Emit socket event for real-time updates
    io.emit('donation:created', donation);

    res.status(201).json(donation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    const updatedDonation = await Donation.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedBy: req.user?._id || null,
      },
      { new: true, runValidators: true }
    );

    // Emit socket event for real-time updates
    io.emit('donation:updated', updatedDonation);

    res.json(updatedDonation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    await donation.deleteOne();

    // Emit socket event for real-time updates
    io.emit('donation:deleted', { id: req.params.id });

    res.json({ message: 'Donation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDonationStats = async (req, res) => {
  try {
    const stats = await Donation.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          averageAmount: { $avg: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const monthlyStats = await Donation.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({
      overall: stats[0] || { totalAmount: 0, averageAmount: 0, count: 0 },
      monthly: monthlyStats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};