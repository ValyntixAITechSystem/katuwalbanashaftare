import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>© {new Date().getFullYear()} NDS Software. All rights reserved.</span>
        <span>Kotwal Bansa Bhatika v1.0.0</span>
      </div>
    </footer>
  );
};