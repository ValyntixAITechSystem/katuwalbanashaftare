import Member from '../models/Member.js';
import FamilyRelationship from '../models/FamilyRelationship.js';

export const buildFamilyTree = async (rootId = null) => {
  try {
    let rootMember;
    
    if (rootId) {
      rootMember = await Member.findById(rootId);
      if (!rootMember) {
        throw new Error('Root member not found');
      }
    } else {
      // Find the oldest member or the one with most relationships as root
      rootMember = await Member.findOne()
        .sort({ createdAt: 1 })
        .limit(1);
      
      if (!rootMember) {
        return null;
      }
    }

    const tree = await buildTreeRecursive(rootMember._id);
    return tree;
  } catch (error) {
    console.error('Error building family tree:', error);
    throw error;
  }
};

const buildTreeRecursive = async (memberId, visited = new Set()) => {
  if (visited.has(memberId.toString())) {
    return null;
  }
  visited.add(memberId.toString());

  const member = await Member.findById(memberId);
  if (!member) {
    return null;
  }

  const relationships = await FamilyRelationship.find({
    $or: [
      { member: memberId },
      { relatedMember: memberId }
    ],
    isActive: true
  }).populate('member relatedMember');

  const children = [];
  const processedChildren = new Set();

  for (const rel of relationships) {
    let childId;
    if (rel.member._id.toString() === memberId.toString()) {
      childId = rel.relatedMember._id;
    } else {
      childId = rel.member._id;
    }

    if (!processedChildren.has(childId.toString())) {
      processedChildren.add(childId.toString());
      const childNode = await buildTreeRecursive(childId, visited);
      if (childNode) {
        children.push(childNode);
      }
    }
  }

  return {
    _id: member._id,
    uuid: member.uuid,
    name: member.name,
    relation: member.relation,
    gender: member.gender,
    photo: member.photo,
    dob: member.dob,
    dod: member.dod,
    isAlive: member.isAlive,
    children: children,
  };
};

export const getAncestors = async (memberId) => {
  const ancestors = [];
  let currentId = memberId;

  while (currentId) {
    const parent = await FamilyRelationship.findOne({
      relatedMember: currentId,
      relationshipType: 'parent',
      isActive: true,
    }).populate('member');

    if (parent && parent.member) {
      ancestors.push(parent.member);
      currentId = parent.member._id;
    } else {
      break;
    }
  }

  return ancestors;
};

export const getDescendants = async (memberId, depth = null) => {
  const descendants = [];
  const queue = [{ id: memberId, level: 0 }];
  const visited = new Set();

  while (queue.length > 0) {
    const { id, level } = queue.shift();
    if (depth !== null && level >= depth) continue;
    if (visited.has(id.toString())) continue;
    visited.add(id.toString());

    const children = await FamilyRelationship.find({
      member: id,
      relationshipType: 'child',
      isActive: true,
    }).populate('relatedMember');

    for (const child of children) {
      if (child.relatedMember) {
        descendants.push(child.relatedMember);
        queue.push({ id: child.relatedMember._id, level: level + 1 });
      }
    }
  }

  return descendants;
};