import dayjs from 'dayjs';

export const formatDate = (date, format = 'MMM D, YYYY') => {
  if (!date) return '-';
  return dayjs(date).format(format);
};

export const formatNumber = (num) => {
  if (!num) return '0';
  return new Intl.NumberFormat().format(num);
};

export const formatCurrency = (amount, currency = 'NPR') => {
  if (!amount) return '0';
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const truncateText = (text, length = 50) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
};