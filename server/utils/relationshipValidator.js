
import Member from '../models/Member.js';
import FamilyRelationship from '../models/FamilyRelationship.js';

export const validateRelationship = async (memberId, relatedMemberId, relationshipType) => {
  // Check if members exist
  const [member, relatedMember] = await Promise.all([
    Member.findById(memberId),
    Member.findById(relatedMemberId),
  ]);

  if (!member || !relatedMember) {
    return { valid: false, error: 'One or both members not found' };
  }

  // Check for self-relationship
  if (memberId === relatedMemberId) {
    return { valid: false, error: 'Cannot relate a member to themselves' };
  }

  // Check for duplicate relationship
  const existing = await FamilyRelationship.findOne({
    $or: [
      { member: memberId, relatedMember: relatedMemberId },
      { member: relatedMemberId, relatedMember: memberId },
    ],
    relationshipType,
    isActive: true,
  });

  if (existing) {
    return { valid: false, error: 'Relationship already exists' };
  }

  return { valid: true };
};

export const getReverseRelationshipType = (type) => {
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

export const validateFamilyTreeCycle = async (memberId, relatedMemberId) => {
  // Check if adding this relationship would create a cycle
  const visited = new Set();
  const queue = [memberId];

  while (queue.length > 0) {
    const currentId = queue.shift();
    if (visited.has(currentId.toString())) continue;
    visited.add(currentId.toString());

    if (currentId.toString() === relatedMemberId.toString()) {
      return { valid: false, error: 'Adding this relationship would create a cycle' };
    }

    const relationships = await FamilyRelationship.find({
      $or: [
        { member: currentId },
        { relatedMember: currentId },
      ],
      isActive: true,
    });

    for (const rel of relationships) {
      let nextId;
      if (rel.member.toString() === currentId.toString()) {
        nextId = rel.relatedMember;
      } else {
        nextId = rel.member;
      }
      if (!visited.has(nextId.toString())) {
        queue.push(nextId);
      }
    }
  }

  return { valid: true };
};