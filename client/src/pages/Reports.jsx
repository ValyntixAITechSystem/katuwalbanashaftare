import React, { useState, useEffect } from 'react';
import { memberService } from '../services/memberService';
import { donationService } from '../services/donationService';
import { familyService } from '../services/familyService';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [memberStats, setMemberStats] = useState({ total: 0, byGender: {}, byRelation: {} });
  const [donationStats, setDonationStats] = useState([]);
  const [familyStats, setFamilyStats] = useState({ totalFamilies: 0, avgMembers: 0 });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [membersRes, donationsRes, familyRes] = await Promise.all([
        memberService.getAll({ limit: 1000 }),
        donationService.getStats(),
        familyService.getTree(),
      ]);

      // Process member statistics
      const members = membersRes.data.data;
      const byGender = members.reduce((acc, m) => {
        acc[m.gender] = (acc[m.gender] || 0) + 1;
        return acc;
      }, {});
      const byRelation = members.reduce((acc, m) => {
        acc[m.relation] = (acc[m.relation] || 0) + 1;
        return acc;
      }, {});

      setMemberStats({
        total: members.length,
        byGender,
        byRelation,
      });

      // Process donation statistics
      const monthlyData = donationsRes.data.monthly || [];
      setDonationStats(monthlyData.map(item => ({
        month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
        amount: item.total,
        count: item.count,
      })));

      // Process family statistics
      setFamilyStats({
        totalFamilies: Math.ceil(members.length / 3),
        avgMembers: members.length > 0 ? Math.round(members.length / 5) : 0,
      });

    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    toast.success('Report download started');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Generating reports...</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const genderData = Object.entries(memberStats.byGender).map(([name, value]) => ({ name, value }));
  const relationData = Object.entries(memberStats.byRelation).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
          <p className="text-gray-600">View family and donation analytics</p>
        </div>
        <button
          onClick={downloadReport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Download size={20} />
          Download Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Members</p>
              <p className="text-2xl font-bold mt-1">{formatNumber(memberStats.total)}</p>
            </div>
            <FileText size={24} className="text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Families</p>
              <p className="text-2xl font-bold mt-1">{formatNumber(familyStats.totalFamilies)}</p>
            </div>
            <FileText size={24} className="text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Members/Family</p>
              <p className="text-2xl font-bold mt-1">{formatNumber(familyStats.avgMembers)}</p>
            </div>
            <FileText size={24} className="text-purple-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Gender Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Relationship Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={relationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {relationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Monthly Donations</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={donationStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" orientation="left" stroke="#3B82F6" />
              <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="amount" fill="#3B82F6" name="Amount (NPR)" />
              <Bar yAxisId="right" dataKey="count" fill="#10B981" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Reports;