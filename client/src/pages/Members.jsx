import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { memberService } from '../services/memberService';
import { socketService } from '../services/socketService';
import { formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';
import { useDebounce } from '../utils/hooks';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const navigate = useNavigate();

  const debouncedSearch = useDebounce(searchQuery, 300);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await memberService.getAll({
        search: debouncedSearch,
        page: pagination.page,
        limit: pagination.limit,
      });
      setMembers(response.data.data);
      setPagination({
        ...pagination,
        total: response.data.pagination?.total || 0,
      });
    } catch (error) {
      toast.error('Failed to fetch members');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchMembers();
    const socket = socketService.connect();

    socket.on('member:created', fetchMembers);
    socket.on('member:updated', fetchMembers);
    socket.on('member:deleted', fetchMembers);

    return () => {
      socket.off('member:created');
      socket.off('member:updated');
      socket.off('member:deleted');
    };
  }, [fetchMembers]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await memberService.delete(id);
        toast.success('Member deleted successfully');
      } catch (error) {
        toast.error('Failed to delete member');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Members</h1>
          <p className="text-gray-600">Manage family members</p>
        </div>
        <button
          onClick={() => navigate('/data-entry')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Add Member
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="10">10 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Relation</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Date of Birth</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Phone</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {members.map((member) => (
                    <tr key={member._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={member.photo || '/default-avatar.png'}
                            alt={member.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <span className="font-medium">{member.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{member.relation}</td>
                      <td className="px-4 py-3">{formatDate(member.dob)}</td>
                      <td className="px-4 py-3">{member.phone || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/profile/${member._id}`)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Eye size={18} className="text-gray-600" />
                          </button>
                          <button
                            onClick={() => navigate(`/data-entry?edit=${member._id}`)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Edit size={18} className="text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(member._id)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Trash2 size={18} className="text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {members.length} of {pagination.total} members
              </div>
              <div className="flex gap-2">
                <button
                  disabled={pagination.page === 1}
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={pagination.page * pagination.limit >= pagination.total}
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Members;