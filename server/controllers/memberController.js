import Member from '../models/Member.js';
import FamilyRelationship from '../models/FamilyRelationship.js';
import { io } from '../server.js';
import cloudinary from '../config/cloudinary.js';

export const getMembers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const [members, total] = await Promise.all([
      Member.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Member.countDocuments(query),
    ]);

    res.json({
      data: members,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMemberById = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const relationships = await FamilyRelationship.find({
      $or: [
        { member: member._id },
        { relatedMember: member._id },
      ],
      isActive: true,
    }).populate('member relatedMember');

    res.json({
      ...member.toObject(),
      relationships,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createMember = async (req, res) => {
  try {
    const memberData = {
      ...req.body,
      createdBy: req.user?._id || null,
      updatedBy: req.user?._id || null,
    };

    const member = new Member(memberData);
    await member.save();

    // Emit socket event for real-time updates
    io.emit('member:created', member);

    res.status(201).json(member);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Duplicate entry found' });
    }
    res.status(400).json({ message: error.message });
  }
};

export const updateMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // If new photo uploaded, delete old photo from Cloudinary
    if (req.body.photo && member.photo && req.body.photo !== member.photo) {
      const publicId = member.photo.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }

    const updatedMember = await Member.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedBy: req.user?._id || null,
      },
      { new: true, runValidators: true }
    );

    // Emit socket event for real-time updates
    io.emit('member:updated', updatedMember);

    res.json(updatedMember);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Duplicate entry found' });
    }
    res.status(400).json({ message: error.message });
  }
};

export const deleteMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Delete photo from Cloudinary if exists
    if (member.photo) {
      const publicId = member.photo.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }

    // Delete all relationships
    await FamilyRelationship.deleteMany({
      $or: [
        { member: member._id },
        { relatedMember: member._id },
      ],
    });

    await Member.findByIdAndDelete(req.params.id);

    // Emit socket event for real-time updates
    io.emit('member:deleted', { id: req.params.id });

    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchMembers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const members = await Member.find({
      $text: { $search: query },
    })
    .sort({ score: { $meta: 'textScore' } })
    .limit(20);

    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};