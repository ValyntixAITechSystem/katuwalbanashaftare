import Donation from '../models/Donation.js';
import Member from '../models/Member.js';

export const createDonation = async (donationData) => {
  // Validate donor exists
  const donor = await Member.findById(donationData.donor);
  if (!donor) {
    throw new Error('Donor not found');
  }

  const donation = new Donation(donationData);
  await donation.save();
  return donation;
};

export const getDonationAnalytics = async (filter = {}) => {
  const matchStage = {};
  
  if (filter.startDate && filter.endDate) {
    matchStage.date = {
      $gte: new Date(filter.startDate),
      $lte: new Date(filter.endDate),
    };
  }

  if (filter.donor) {
    matchStage.donor = filter.donor;
  }

  const [overall, byPurpose, monthly, topDonors] = await Promise.all([
    // Overall stats
    Donation.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          averageAmount: { $avg: '$amount' },
          count: { $sum: 1 },
          maxAmount: { $max: '$amount' },
          minAmount: { $min: '$amount' },
        },
      },
    ]),

    // By purpose
    Donation.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$purpose',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]),

    // Monthly breakdown
    Donation.aggregate([
      { $match: matchStage },
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
    ]),

    // Top donors
    Donation.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$donor',
          totalAmount: { $sum: '$amount' },
          donationCount: { $sum: 1 },
          averageAmount: { $avg: '$amount' },
        },
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'members',
          localField: '_id',
          foreignField: '_id',
          as: 'donorInfo',
        },
      },
      { $unwind: '$donorInfo' },
    ]),
  ]);

  return {
    overall: overall[0] || { totalAmount: 0, averageAmount: 0, count: 0 },
    byPurpose,
    monthly,
    topDonors,
  };
};

export const generateDonationReport = async (startDate, endDate, format = 'json') => {
  const analytics = await getDonationAnalytics({ startDate, endDate });
  
  // Add date range to report
  return {
    reportDate: new Date(),
    dateRange: { startDate, endDate },
    ...analytics,
  };
};