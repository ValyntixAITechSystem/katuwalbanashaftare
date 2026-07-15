import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GitBranch, 
  PlusCircle, 
  Heart, 
  FileText, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/members', icon: Users, label: 'Members' },
  { path: '/family-tree', icon: GitBranch, label: 'Family Tree' },
  { path: '/data-entry', icon: PlusCircle, label: 'Data Entry' },
  { path: '/donation', icon: Heart, label: 'Donation' },
  { path: '/reports', icon: FileText, label: 'Reports' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export const Sidebar = ({ isOpen, setIsOpen }) => {
  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 240 : 72 }}
      className="bg-white border-r border-gray-200 h-screen flex flex-col"
    >
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {isOpen && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-bold text-lg text-gray-800"
          >
            Katuwal Batika
          </motion.span>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 hover:bg-gray-100 rounded-lg"
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <Icon size={20} />
            {isOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm"
              >
                {label}
              </motion.span>
            )}
          </NavLink>
        ))}
      </nav>
    </motion.aside>
  );
};