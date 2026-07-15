export const validateMember = (data) => {
  const errors = {};

  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Name is required and must be at least 2 characters';
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Invalid email format';
  }

  if (data.phone && !/^[0-9]{10,15}$/.test(data.phone)) {
    errors.phone = 'Invalid phone number';
  }

  if (data.dob && !isValidDate(data.dob)) {
    errors.dob = 'Invalid date format';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const isValidDate = (date) => {
  return !isNaN(new Date(date).getTime());
};

export const validateRelationship = (data) => {
  const errors = {};

  if (!data.memberId) {
    errors.memberId = 'Member is required';
  }

  if (!data.relatedMemberId) {
    errors.relatedMemberId = 'Related member is required';
  }

  if (data.memberId === data.relatedMemberId) {
    errors.relatedMemberId = 'Cannot relate a member to themselves';
  }

  if (!data.relationshipType) {
    errors.relationshipType = 'Relationship type is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};