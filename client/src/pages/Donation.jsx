import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { donationService } from '../services/donationService';
import { memberService } from '../services/memberService';
import { socketService } from '../services/socketService';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Heart, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Donation = () => {
  const [donations, setDonations] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [stats, setStats] = useState({ totalAmount: 0, totalDonations: 0 });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      donor: '',
      amount: '',
      purpose: 'general',
      description: '',
      date: new Date().toISOString().split('T')[0],
    }
  });

  useEffect(() => {
    fetchDonations();
    fetchMembers();
    fetchStats();

    const socket = socketService.connect();
    socket.on('donation:created', fetchDonations);
    socket.on('donation:updated', fetchDonations);
    socket.on('donation:deleted', fetchDonations);

    return () => {
      socket.off('donation:created');
      socket.off('donation:updated');
      socket.off('donation:deleted');
    };
  }, []);

  const fetchDonations = async () => {
    try {
      const response = await donationService.getAll({ limit: 50 });
      setDonations(response.data.data);
      setStats({
        totalAmount: response.data.summary?.totalAmount || 0,
        totalDonations: response.data.pagination?.total || 0,
      });
    } catch (error) {
      toast.error('Failed to fetch donations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await memberService.getAll({ limit: 100 });
      setMembers(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch members');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await donationService.getStats();
      setStats({
        totalAmount: response.data.overall?.totalAmount || 0,
        totalDonations: response.data.overall?.count || 0,
      });
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await donationService.update(editingId, data);
        toast.success('Donation updated successfully');
      } else {
        await donationService.create(data);
        toast.success('Donation recorded successfully');
      }
      reset();
      setShowForm(false);
      setEditingId(null);
      fetchDonations();
      fetchStats();
    } catch (error) {
      toast.error('Failed to save donation');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this donation?')) {
      try {
        await donationService.delete(id);
        toast.success('Donation deleted successfully');
        fetchDonations();
        fetchStats();
      } catch (error) {
        toast.error('Failed to delete donation');
      }
    }
  };

  const handleEdit = (donation) => {
    setEditingId(donation._id);
    reset({
      donor: donation.donor._id,
      amount: donation.amount,
      purpose: donation.purpose,
      description: donation.description,
      date: new Date(donation.date).toISOString().split('T')[0],
    });
    setShowForm(true);
  };

  const getPurposeColor = (purpose) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800',
      education: 'bg-green-100 text-green-800',
      medical: 'bg-red-100 text-red-800',
      emergency: 'bg-orange-100 text-orange-800',
      event: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[purpose] || colors.general;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Donations</h1>
          <p className="text-gray-600">Manage family donations</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            reset();
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
          {showForm ? 'Close Form' : 'Add Donation'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Donations</p>
              <p className="text-2xl font-bold mt-1">{stats.totalDonations}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Heart size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(stats.totalAmount)}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Heart size={24} className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Donation</p>
              <p className="text-2xl font-bold mt-1">
                {stats.totalDonations > 0 ? formatCurrency(stats.totalAmount / stats.totalDonations) : '0'}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Heart size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Donation' : 'Record New Donation'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Donor *</label>
              <select
                {...register('donor', { required: 'Donor is required' })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Donor</option>
                {members.map(member => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>
              {errors.donor && <p className="text-red-500 text-sm mt-1">{errors.donor.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount (NPR) *</label>
              <input
                type="number"
                step="0.01"
                {...register('amount', { 
                  required: 'Amount is required',
                  min: { value: 1, message: 'Amount must be greater than 0' }
                })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Purpose</label>
              <select
                {...register('purpose')}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="general">General</option>
                <option value="education">Education</option>
                <option value="medical">Medical</option>
                <option value="emergency">Emergency</option>
                <option value="event">Event</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                {...register('date')}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                {...register('description')}
                rows={2}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {editingId ? 'Update Donation' : 'Record Donation'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  reset();
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Donor</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Purpose</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Description</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">Loading...</td>
                </tr>
              ) : donations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">No donations recorded</td>
                </tr>
              ) : (
                donations.map((donation) => (
                  <tr key={donation._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={donation.donor?.photo || '/default-avatar.png'}
                          alt={donation.donor?.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="font-medium">{donation.donor?.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-green-600">
                      {formatCurrency(donation.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPurposeColor(donation.purpose)}`}>
                        {donation.purpose}
                      </span>
                    </td>
                    <td className="px-4 py-3">{formatDate(donation.date)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                      {donation.description || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(donation)}
                          className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(donation._id)}
                          className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Donation;