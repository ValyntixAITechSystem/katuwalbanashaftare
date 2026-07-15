import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, GitBranch, Heart, TrendingUp } from 'lucide-react';
import { memberService } from '../services/memberService';
import { donationService } from '../services/donationService';
import { socketService } from '../services/socketService';
import { formatNumber } from '../utils/formatters';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-lg bg-${color}-50 text-${color}-600`}>
        <Icon size={24} />
      </div>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalFamilies: 0,
    totalDonations: 0,
    recentMembers: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const socket = socketService.connect();
    
    socket.on('member:created', fetchDashboardData);
    socket.on('member:updated', fetchDashboardData);
    socket.on('member:deleted', fetchDashboardData);
    socket.on('donation:created', fetchDashboardData);

    return () => {
      socket.off('member:created');
      socket.off('member:updated');
      socket.off('member:deleted');
      socket.off('donation:created');
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [membersRes, donationsRes] = await Promise.all([
        memberService.getAll({ limit: 10 }),
        donationService.getAll({ limit: 5 }),
      ]);

      setStats({
        totalMembers: membersRes.data.pagination?.total || 0,
        totalFamilies: membersRes.data.pagination?.total || 0,
        totalDonations: donationsRes.data.pagination?.total || 0,
        recentMembers: membersRes.data.data || [],
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const totalDonations = useMemo(() => {
    return stats.totalDonations || 0;
  }, [stats.totalDonations]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome to Kotwal Bansa Bhatika</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          label="Total Members"
          value={formatNumber(stats.totalMembers)}
          color="blue"
        />
        <StatCard
          icon={GitBranch}
          label="Families"
          value={formatNumber(stats.totalFamilies)}
          color="green"
        />
        <StatCard
          icon={Heart}
          label="Donations"
          value={formatNumber(stats.totalDonations)}
          color="red"
        />
        <StatCard
          icon={TrendingUp}
          label="Growth Rate"
          value="12.5%"
          color="purple"
        />
      </div>

      {!loading && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Recent Members</h2>
          <div className="space-y-3">
            {stats.recentMembers.map((member) => (
              <div key={member._id} className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-3">
                  <img
                    src={member.photo || '/default-avatar.png'}
                    alt={member.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-gray-600">{member.relation}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{member.createdAt}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;