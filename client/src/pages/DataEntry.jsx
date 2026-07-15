import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { memberService } from '../services/memberService';
import { familyService } from '../services/familyService';
import { uploadToCloudinary } from '../services/api';
import { validateMember } from '../utils/validators';
import toast from 'react-hot-toast';
import { Upload, X } from 'lucide-react';

const DataEntry = () => {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [relationships, setRelationships] = useState([]);
  const [members, setMembers] = useState([]);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      relation: 'member',
      gender: 'male',
      dob: '',
      phone: '',
      email: '',
      address: '',
      occupation: '',
      notes: '',
    }
  });

  useEffect(() => {
    if (editId) {
      loadMember(editId);
    }
    loadMembers();
  }, [editId]);

  const loadMember = async (id) => {
    try {
      const response = await memberService.getById(id);
      const member = response.data;
      reset(member);
      setPhoto(member.photo);
    } catch (error) {
      toast.error('Failed to load member data');
    }
  };

  const loadMembers = async () => {
    try {
      const response = await memberService.getAll({ limit: 100 });
      setMembers(response.data.data);
    } catch (error) {
      toast.error('Failed to load members');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadToCloudinary(file);
      setPhoto(url);
      toast.success('Photo uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const memberData = {
        ...data,
        photo,
        relationships: relationships.map(r => r._id)
      };

      const response = editId
        ? await memberService.update(editId, memberData)
        : await memberService.create(memberData);

      toast.success(editId ? 'Member updated successfully' : 'Member created successfully');
      
      if (!editId) {
        reset();
        setPhoto(null);
        setRelationships([]);
      }
    } catch (error) {
      toast.error('Failed to save member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Data Entry</h1>
        <p className="text-gray-600">{editId ? 'Edit member' : 'Add new member'}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
            <input
              {...register('name', { required: 'Name is required' })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Relation</label>
            <select
              {...register('relation')}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="member">Member</option>
              <option value="spouse">Spouse</option>
              <option value="child">Child</option>
              <option value="parent">Parent</option>
              <option value="sibling">Sibling</option>
              <option value="grandparent">Grandparent</option>
              <option value="grandchild">Grandchild</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <select
              {...register('gender')}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
            <input
              type="date"
              {...register('dob')}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              {...register('phone')}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              {...register('email')}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <input
              {...register('address')}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
            <input
              {...register('occupation')}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
            <div className="flex items-center gap-4">
              {photo && (
                <div className="relative">
                  <img src={photo} alt="Preview" className="w-20 h-20 rounded-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhoto(null)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              <label className="cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
                <div className="flex items-center gap-2">
                  <Upload size={20} />
                  {uploading ? 'Uploading...' : 'Upload Photo'}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : (editId ? 'Update Member' : 'Add Member')}
          </button>
          {editId && (
            <button
              type="button"
              onClick={() => {
                reset();
                setPhoto(null);
                window.history.pushState({}, '', '/data-entry');
              }}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default DataEntry;