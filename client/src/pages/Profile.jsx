import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { memberService } from '../services/memberService';
import { familyService } from '../services/familyService';
import { formatDate } from '../utils/formatters';
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Edit, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemberData();
  }, [id]);

  const fetchMemberData = async () => {
    try {
      setLoading(true);
      const response = await memberService.getById(id);
      setMember(response.data);
      setRelationships(response.data.relationships || []);
    } catch (error) {
      toast.error('Failed to load member profile');
      navigate('/members');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Member not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/members')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft size={20} />
          Back to Members
        </button>
        <button
          onClick={() => navigate(`/data-entry?edit=${member._id}`)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Edit size={20} />
          Edit Profile
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-6">
            <img
              src={member.photo || '/default-avatar.png'}
              alt={member.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{member.name}</h1>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-sm text-gray-600 capitalize">{member.relation}</span>
                <span className="text-sm text-gray-600">•</span>
                <span className="text-sm text-gray-600 capitalize">{member.gender}</span>
                {member.isAlive ? (
                  <span className="text-sm text-green-600">Alive</span>
                ) : (
                  <span className="text-sm text-red-600">Deceased</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Personal Information</h2>
            
            <div className="flex items-start gap-3">
              <Calendar size={20} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Date of Birth</p>
                <p className="text-gray-800">{formatDate(member.dob) || 'Not specified'}</p>
              </div>
            </div>

            {member.dod && (
              <div className="flex items-start gap-3">
                <Calendar size={20} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Date of Death</p>
                  <p className="text-gray-800">{formatDate(member.dod)}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Briefcase size={20} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Occupation</p>
                <p className="text-gray-800">{member.occupation || 'Not specified'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Contact Information</h2>

            <div className="flex items-start gap-3">
              <Phone size={20} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="text-gray-800">{member.phone || 'Not specified'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail size={20} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-gray-800">{member.email || 'Not specified'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="text-gray-800">{member.address || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </div>

        {member.notes && (
          <div className="px-6 pb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Notes</h2>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{member.notes}</p>
          </div>
        )}

        {relationships.length > 0 && (
          <div className="px-6 pb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Family Relationships</h2>
            <div className="space-y-3">
              {relationships.map((rel) => {
                const isMember = rel.member._id === member._id;
                const relatedPerson = isMember ? rel.relatedMember : rel.member;
                const relationshipType = isMember ? rel.relationshipType : getReverseType(rel.relationshipType);
                
                return (
                  <div key={rel._id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <img
                        src={relatedPerson?.photo || '/default-avatar.png'}
                        alt={relatedPerson?.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">{relatedPerson?.name}</p>
                        <p className="text-sm text-gray-600 capitalize">{relationshipType}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/profile/${relatedPerson?._id}`)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      View Profile
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const getReverseType = (type) => {
  const reverseMap = {
    spouse: 'spouse',
    parent: 'child',
    child: 'parent',
    sibling: 'sibling',
    grandparent: 'grandchild',
    grandchild: 'grandparent',
    aunt_uncle: 'niece_nephew',
    niece_nephew: 'aunt_uncle',
    cousin: 'cousin',
  };
  return reverseMap[type] || type;
};

export default Profile;