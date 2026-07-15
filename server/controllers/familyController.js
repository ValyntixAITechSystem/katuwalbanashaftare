import FamilyRelationship from '../models/FamilyRelationship.js';
import Member from '../models/Member.js';
import {
  buildFamilyTree,
  getAncestors as getAncestorsService,
  getDescendants as getDescendantsService
} from '../services/familyTreeService.js';
import { io } from '../server.js';

export const getFamilyTree = async (req, res) => {
  try {
    const { rootId } = req.query;
    const tree = await buildFamilyTree(rootId);
    res.json(tree);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// export const getAncestors = async (req, res) => {
//   try {
//     const { memberId } = req.params;
//     const ancestors = await getAncestors(memberId);
//     res.json(ancestors);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
export const getAncestors = async (req, res) => {
  try {
    const { memberId } = req.params;
    const ancestors = await getAncestorsService(memberId);
    res.json(ancestors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// export const getDescendants = async (req, res) => {
//   try {
//     const { memberId } = req.params;
//     const { depth } = req.query;
//     const descendants = await getDescendants(memberId, depth ? parseInt(depth) : null);
//     res.json(descendants);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

export const getDescendants = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { depth } = req.query;

    const descendants = await getDescendantsService(
      memberId,
      depth ? parseInt(depth) : null
    );

    res.json(descendants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRelationships = async (req, res) => {
  try {
    const { memberId } = req.params;
    const relationships = await FamilyRelationship.find({
      $or: [
        { member: memberId },
        { relatedMember: memberId },
      ],
      isActive: true,
    }).populate('member relatedMember');

    res.json(relationships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addRelationship = async (req, res) => {
  try {
    const { memberId, relatedMemberId, relationshipType, isBidirectional } = req.body;

    // Validate members exist
    const [member, relatedMember] = await Promise.all([
      Member.findById(memberId),
      Member.findById(relatedMemberId),
    ]);

    if (!member || !relatedMember) {
      return res.status(404).json({ message: 'One or both members not found' });
    }

    // Check for duplicate relationship
    const existing = await FamilyRelationship.findOne({
      member: memberId,
      relatedMember: relatedMemberId,
      relationshipType,
      isActive: true,
    });

    if (existing) {
      return res.status(400).json({ message: 'Relationship already exists' });
    }

    const relationship = new FamilyRelationship({
      member: memberId,
      relatedMember: relatedMemberId,
      relationshipType,
      isBidirectional: isBidirectional || false,
      createdBy: req.user?._id || null,
    });

    await relationship.save();

    // If bidirectional, create reverse relationship
    if (isBidirectional) {
      const reverseType = getReverseRelationshipType(relationshipType);
      if (reverseType) {
        const reverseRelationship = new FamilyRelationship({
          member: relatedMemberId,
          relatedMember: memberId,
          relationshipType: reverseType,
          isBidirectional: true,
          createdBy: req.user?._id || null,
        });
        await reverseRelationship.save();
      }
    }

    // Emit socket event for real-time updates
    io.emit('family:updated', relationship);

    res.status(201).json(relationship);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Duplicate relationship' });
    }
    res.status(400).json({ message: error.message });
  }
};

export const updateRelationship = async (req, res) => {
  try {
    const { id } = req.params;
    const { relationshipType, isActive } = req.body;

    const relationship = await FamilyRelationship.findById(id);
    if (!relationship) {
      return res.status(404).json({ message: 'Relationship not found' });
    }

    relationship.relationshipType = relationshipType || relationship.relationshipType;
    relationship.isActive = isActive !== undefined ? isActive : relationship.isActive;
    relationship.updatedBy = req.user?._id || null;

    await relationship.save();

    // Emit socket event for real-time updates
    io.emit('family:updated', relationship);

    res.json(relationship);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteRelationship = async (req, res) => {
  try {
    const { id } = req.params;

    const relationship = await FamilyRelationship.findById(id);
    if (!relationship) {
      return res.status(404).json({ message: 'Relationship not found' });
    }

    // Delete reverse relationship if exists
    if (relationship.isBidirectional) {
      await FamilyRelationship.deleteOne({
        member: relationship.relatedMember,
        relatedMember: relationship.member,
        isBidirectional: true,
      });
    }

    await relationship.deleteOne();

    // Emit socket event for real-time updates
    io.emit('family:deleted', { id });

    res.json({ message: 'Relationship deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReverseRelationshipType = (type) => {
  const reverseMap = {
    spouse: 'spouse',
    parent: 'child',
    child: 'parent',
    sibling: 'sibling',
    grandparent: 'grandchild',
    grandchild: 'grandparent',
    aunt_uncle: 'niece_nephew',
    niece_nephew: 'aunt_uncle',
    cousin: 'cousin',
  };
  return reverseMap[type] || null;
};