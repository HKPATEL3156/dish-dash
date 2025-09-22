import React, { useState, useEffect } from 'react';
import { FiUser, FiEdit2, FiSave, FiX, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import axios from 'axios';

const UserProfile = () => {
  const [userProfile, setUserProfile] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    zipCode: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  // Get auth token
  const token = localStorage.getItem('authToken');
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  // Fetch user profile on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('http://localhost:4000/api/user/profile', {
        headers: authHeaders
      });

      if (response.data.success) {
        setUserProfile(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch profile');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess('');

      const response = await axios.put('http://localhost:4000/api/user/profile', {
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        phone: userProfile.phone,
        address: userProfile.address,
        city: userProfile.city,
        zipCode: userProfile.zipCode
      }, {
        headers: authHeaders
      });

      if (response.data.success) {
        setUserProfile(response.data.data);
        setIsEditing(false);
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchUserProfile(); // Reset to original data
    setError(null);
    setSuccess('');
  };

  if (loading) {
    return (
      <div className="bg-[#4b3b3b]/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border-2 border-amber-500/20">
        <div className="flex items-center justify-center py-8">
          <div className="text-amber-400">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#4b3b3b]/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border-2 border-amber-500/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center">
            <FiUser className="text-2xl text-amber-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-amber-300">User Profile</h3>
            <p className="text-sm text-amber-400/60">Manage your account details</p>
          </div>
        </div>
        
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 rounded-lg transition-colors"
          >
            <FiEdit2 className="text-sm" />
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-300 rounded-lg transition-colors disabled:opacity-50"
            >
              <FiSave className="text-sm" />
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg transition-colors disabled:opacity-50"
            >
              <FiX className="text-sm" />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-600/20 border border-red-500/30 text-red-300 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-600/20 border border-green-500/30 text-green-300 rounded-lg">
          {success}
        </div>
      )}

      {/* Profile Fields */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Username (Read-only) */}
        <div className="space-y-2">
          <label className="text-sm text-amber-400">Username</label>
          <div className="flex items-center gap-2 p-3 bg-[#3a2b2b]/50 rounded-lg border border-amber-500/20">
            <FiUser className="text-amber-400" />
            <span className="text-amber-100">{userProfile.username}</span>
          </div>
        </div>

        {/* Email (Read-only) */}
        <div className="space-y-2">
          <label className="text-sm text-amber-400">Email</label>
          <div className="flex items-center gap-2 p-3 bg-[#3a2b2b]/50 rounded-lg border border-amber-500/20">
            <FiMail className="text-amber-400" />
            <span className="text-amber-100">{userProfile.email}</span>
          </div>
        </div>

        {/* First Name */}
        <div className="space-y-2">
          <label className="text-sm text-amber-400">First Name</label>
          {isEditing ? (
            <input
              type="text"
              name="firstName"
              value={userProfile.firstName}
              onChange={handleInputChange}
              className="w-full p-3 bg-[#3a2b2b]/50 rounded-lg border border-amber-500/20 text-amber-100 focus:border-amber-400 focus:outline-none"
              placeholder="Enter first name"
            />
          ) : (
            <div className="p-3 bg-[#3a2b2b]/30 rounded-lg border border-amber-500/20 text-amber-100">
              {userProfile.firstName || 'Not provided'}
            </div>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <label className="text-sm text-amber-400">Last Name</label>
          {isEditing ? (
            <input
              type="text"
              name="lastName"
              value={userProfile.lastName}
              onChange={handleInputChange}
              className="w-full p-3 bg-[#3a2b2b]/50 rounded-lg border border-amber-500/20 text-amber-100 focus:border-amber-400 focus:outline-none"
              placeholder="Enter last name"
            />
          ) : (
            <div className="p-3 bg-[#3a2b2b]/30 rounded-lg border border-amber-500/20 text-amber-100">
              {userProfile.lastName || 'Not provided'}
            </div>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label className="text-sm text-amber-400">Phone</label>
          {isEditing ? (
            <input
              type="tel"
              name="phone"
              value={userProfile.phone}
              onChange={handleInputChange}
              className="w-full p-3 bg-[#3a2b2b]/50 rounded-lg border border-amber-500/20 text-amber-100 focus:border-amber-400 focus:outline-none"
              placeholder="Enter phone number"
            />
          ) : (
            <div className="flex items-center gap-2 p-3 bg-[#3a2b2b]/30 rounded-lg border border-amber-500/20">
              <FiPhone className="text-amber-400" />
              <span className="text-amber-100">{userProfile.phone || 'Not provided'}</span>
            </div>
          )}
        </div>

        {/* Address */}
        <div className="space-y-2">
          <label className="text-sm text-amber-400">Address</label>
          {isEditing ? (
            <input
              type="text"
              name="address"
              value={userProfile.address}
              onChange={handleInputChange}
              className="w-full p-3 bg-[#3a2b2b]/50 rounded-lg border border-amber-500/20 text-amber-100 focus:border-amber-400 focus:outline-none"
              placeholder="Enter address"
            />
          ) : (
            <div className="flex items-center gap-2 p-3 bg-[#3a2b2b]/30 rounded-lg border border-amber-500/20">
              <FiMapPin className="text-amber-400" />
              <span className="text-amber-100">{userProfile.address || 'Not provided'}</span>
            </div>
          )}
        </div>

        {/* City */}
        <div className="space-y-2">
          <label className="text-sm text-amber-400">City</label>
          {isEditing ? (
            <input
              type="text"
              name="city"
              value={userProfile.city}
              onChange={handleInputChange}
              className="w-full p-3 bg-[#3a2b2b]/50 rounded-lg border border-amber-500/20 text-amber-100 focus:border-amber-400 focus:outline-none"
              placeholder="Enter city"
            />
          ) : (
            <div className="p-3 bg-[#3a2b2b]/30 rounded-lg border border-amber-500/20 text-amber-100">
              {userProfile.city || 'Not provided'}
            </div>
          )}
        </div>

        {/* Zip Code */}
        <div className="space-y-2">
          <label className="text-sm text-amber-400">Zip Code</label>
          {isEditing ? (
            <input
              type="text"
              name="zipCode"
              value={userProfile.zipCode}
              onChange={handleInputChange}
              className="w-full p-3 bg-[#3a2b2b]/50 rounded-lg border border-amber-500/20 text-amber-100 focus:border-amber-400 focus:outline-none"
              placeholder="Enter zip code"
            />
          ) : (
            <div className="p-3 bg-[#3a2b2b]/30 rounded-lg border border-amber-500/20 text-amber-100">
              {userProfile.zipCode || 'Not provided'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;