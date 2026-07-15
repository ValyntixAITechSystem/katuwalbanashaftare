import { v4 as uuidv4 } from 'uuid';

export const generateUUID = () => uuidv4();

export const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

export const sanitizeObject = (obj) => {
  if (!obj) return {};
  const sanitized = { ...obj };
  const keysToRemove = ['__v', 'createdAt', 'updatedAt'];
  keysToRemove.forEach(key => delete sanitized[key]);
  return sanitized;
};

export const paginate = (data, page = 1, limit = 10) => {
  const start = (page - 1) * limit;
  const end = start + limit;
  
  return {
    data: data.slice(start, end),
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: data.length,
      pages: Math.ceil(data.length / limit),
    },
  };
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^[0-9]{10,15}$/;
  return re.test(phone);
};

export const getAge = (dob) => {
  if (!dob) return null;
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const generateId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};