import { isValidObjectId } from 'mongoose';

export const isValidMongoId = (id) => {
  return isValidObjectId(id);
};

export const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return { valid: false, error: 'Both start and end dates are required' };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }

  if (start > end) {
    return { valid: false, error: 'Start date must be before end date' };
  }

  return { valid: true };
};

export const validatePagination = (page, limit) => {
  const validatedPage = Math.max(1, parseInt(page) || 1);
  const validatedLimit = Math.min(100, Math.max(1, parseInt(limit) || 10));
  
  return {
    page: validatedPage,
    limit: validatedLimit,
    skip: (validatedPage - 1) * validatedLimit,
  };
};

export const sanitizeSearchQuery = (query) => {
  if (!query) return '';
  // Remove special characters that could break regex
  return query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};