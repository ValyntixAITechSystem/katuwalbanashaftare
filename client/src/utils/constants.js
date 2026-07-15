export const APP_NAME = 'Kotwal Bansa Bhatika';
export const APP_VERSION = '1.0.0';
export const COMPANY_NAME = 'NDS Software';

export const RELATIONSHIP_TYPES = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'child', label: 'Child' },
  { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'grandparent', label: 'Grandparent' },
  { value: 'grandchild', label: 'Grandchild' },
  { value: 'other', label: 'Other' },
];

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

export const DONATION_PURPOSES = [
  { value: 'general', label: 'General' },
  { value: 'education', label: 'Education' },
  { value: 'medical', label: 'Medical' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'event', label: 'Event' },
  { value: 'other', label: 'Other' },
];

export const PAGINATION_OPTIONS = [10, 25, 50, 100];

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';