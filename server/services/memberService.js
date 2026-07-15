import Member from '../models/Member.js';
import FamilyRelationship from '../models/FamilyRelationship.js';
import cloudinary from '../config/cloudinary.js';

export const createMemberWithRelationships = async (memberData, relationships = []) => {
  const session = await Member.startSession();
  session.startTransaction();

  try {
    // Create member
    const member = new Member(memberData);
    await member.save({ session });

    // Create relationships if any
    if (relationships.length > 0) {
      const relationshipDocs = relationships.map(rel => ({
        member: member._id,
        relatedMember: rel.relatedMemberId,
        relationshipType: rel.type,
        isBidirectional: true,
        createdBy: memberData.createdBy,
      }));
      await FamilyRelationship.insertMany(relationshipDocs, { session });
    }

    await session.commitTransaction();
    return member;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const updateMemberWithRelationships = async (memberId, updateData, relationships = []) => {
  const session = await Member.startSession();
  session.startTransaction();

  try {
    // Update member
    const member = await Member.findByIdAndUpdate(
      memberId,
      updateData,
      { new: true, session, runValidators: true }
    );

    if (!member) {
      throw new Error('Member not found');
    }

    // Update relationships if provided
    if (relationships.length > 0) {
      // Delete existing relationships
      await FamilyRelationship.deleteMany({
        $or: [
          { member: memberId },
          { relatedMember: memberId },
        ],
      }, { session });

      // Create new relationships
      const relationshipDocs = relationships.map(rel => ({
        member: memberId,
        relatedMember: rel.relatedMemberId,
        relationshipType: rel.type,
        isBidirectional: true,
        updatedBy: updateData.updatedBy,
      }));
      await FamilyRelationship.insertMany(relationshipDocs, { session });
    }

    await session.commitTransaction();
    return member;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const deleteMemberWithRelationships = async (memberId) => {
  const session = await Member.startSession();
  session.startTransaction();

  try {
    const member = await Member.findById(memberId);
    if (!member) {
      throw new Error('Member not found');
    }

    // Delete photo from Cloudinary
    if (member.photo) {
      const publicId = member.photo.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }

    // Delete all relationships
    await FamilyRelationship.deleteMany({
      $or: [
        { member: memberId },
        { relatedMember: memberId },
      ],
    }, { session });

    // Delete member
    await Member.findByIdAndDelete(memberId, { session });

    await session.commitTransaction();
    return member;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const getMemberWithRelationships = async (memberId) => {
  const member = await Member.findById(memberId);
  if (!member) {
    throw new Error('Member not found');
  }

  const relationships = await FamilyRelationship.find({
    $or: [
      { member: memberId },
      { relatedMember: memberId },
    ],
    isActive: true,
  }).populate('member relatedMember');

  return {
    ...member.toObject(),
    relationships,
  };
};

export const searchMembers = async (query, options = {}) => {
  const { limit = 20, page = 1 } = options;
  const skip = (page - 1) * limit;

  const searchQuery = {
    $text: { $search: query },
  };

  const [members, total] = await Promise.all([
    Member.find(searchQuery)
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit),
    Member.countDocuments(searchQuery),
  ]);

  return {
    data: members,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};