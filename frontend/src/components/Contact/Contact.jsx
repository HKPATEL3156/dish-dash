import React, { useState, useEffect } from 'react';
import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiMessageSquare,
  FiGlobe,
  FiSmartphone,
  FiHome,
  FiArrowRight,
  FiUser,
} from 'react-icons/fi';
import { FaUtensils } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    dish: '',
    query: '',
  });

  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get auth token
  const token = localStorage.getItem('authToken');
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:4000/api/user/profile', {
          headers: authHeaders
        });

        if (response.data.success) {
          const profile = response.data.data;
          setUserProfile(profile);
          
          // Pre-fill form with profile data
          setFormData(prev => ({
            ...prev,
            name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.username || '',
            phone: profile.phone || '',
            email: profile.email || '',
            address: profile.address || ''
          }));
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Continue without profile data
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [token]);

  // Contact form fields with read-only configuration
  const contactFormFields = [
    {
      label: 'Full Name',
      name: 'name',
      type: 'text',
      placeholder: 'Enter your full name',
      Icon: FiUser,
      readOnly: !!userProfile // Read-only if user profile exists
    },
    {
      label: 'Phone Number',
      name: 'phone',
      type: 'tel',
      placeholder: '+91 12345 67890',
      pattern: '[+]{0,1}[0-9]{10,13}',
      Icon: FiSmartphone,
      readOnly: !!userProfile // Read-only if user profile exists
    },
    {
      label: 'Email Address',
      name: 'email',
      type: 'email',
      placeholder: 'your.email@example.com',
      Icon: FiMail,
      readOnly: !!userProfile // Read-only if user profile exists
    },
    {
      label: 'Address',
      name: 'address',
      type: 'text',
      placeholder: 'Enter your delivery address',
      Icon: FiHome,
      readOnly: !!userProfile // Read-only if user profile exists
    },
    {
      label: 'Dish Name',
      name: 'dish',
      type: 'text',
      placeholder: 'Enter dish name (e.g., Paneer Tikka)',
      Icon: FaUtensils,
      readOnly: false // Always editable
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    const message = `
      Name: ${formData.name}
      Phone: ${formData.phone}
      Email: ${formData.email}
      Address: ${formData.address}
      Dish: ${formData.dish}
      Query: ${formData.query}
    `;

    const encodedMessage = encodeURIComponent(message);

    const whatsappNumber = '919925128371'; 

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;

    // existing toast
    toast.success('Opening WhatsApp…', {
      style: {
        border: '2px solid #f59e0b',
        padding: '16px',
        color: '#fff',
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(10px)',
      },
      iconTheme: { primary: '#f59e0b', secondary: '#fff' },
    });

    // 5. Redirect:
    window.open(whatsappUrl, '_blank');

    // reset
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      dish: '',
      query: '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const field = contactFormFields.find(f => f.name === name);
    
    // Only allow changes if field is not read-only
    if (!field?.readOnly) {
      setFormData({ ...formData, [name]: value });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-orange-900 via-amber-900 to-green-900 animate-gradient-x py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 font-[Poppins] relative overflow-hidden">
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{ duration: 4000 }}
      />
      {/* Additional decorative elements */}
      <div className="absolute top-20 left-10 w-24 h-24 bg-orange-500/20 rounded-full animate-float"></div>
      <div className="absolute bottom-40 right-20 w-16 h-16 bg-green-500/20 rounded-full animate-float-delayed"></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-8 animate-fade-in-down">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-300">
            Connect With Us
          </span>
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Information Section */}
          <div className="space-y-6">
            <div className="relative bg-white/5 backdrop-blur-lg rounded-2xl p-6 shadow-2xl transform transition-all duration-300 hover:scale-[1.02] animate-card-float border-l-4 border-amber-500 hover:border-amber-400 group">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              <div className="flex items-center mb-4 relative z-10">
                <div className="p-3 bg-gradient-to-br from-amber-500/30 to-amber-700/30 rounded-xl">
                  <FiMapPin className="text-amber-400 text-2xl animate-pulse" />
                </div>
                <h3 className="ml-4 text-amber-100 text-xl font-semibold">
                  Our Main Branch
                </h3>
              </div>
              <div className="pl-12 relative z-10">
                <p className="text-amber-100 font-light text-lg">
                  (1) 45, Sneh-milan Banglows Part - II, Near Gangotri Soc.,
                  Chikuwadi, Surat, Gujarat - 395006
                </p>
                <br />
                <p className="text-amber-100 font-light text-lg">
                  (2) 195, Janakpuri Society, Sadhu Vasvani Rd, Yogi Nagar Road,
                  Rajkot, Gujarat - 360005
                </p>
              </div>
            </div>
            <div className="relative bg-white/5 backdrop-blur-lg rounded-2xl p-6 shadow-2xl transform transition-all duration-300 hover:scale-[1.02] animate-card-float-delayed border-l-4 border-green-500 hover:border-green-400 group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              <div className="flex items-center mb-4 relative z-10">
                <div className="p-3 bg-gradient-to-br from-green-500/30 to-green-700/30 rounded-xl animate-ring">
                  <FiPhone className="text-green-400 text-2xl" />
                </div>
                <h3 className="ml-4 text-amber-100 text-xl font-semibold">
                  Contact Numbers
                </h3>
              </div>
              <div className="pl-12 space-y-2 relative z-10">
                <div className="flex items-center text-amber-100 font-light">
                  <FiGlobe className="text-green-400 text-xl mr-2" />
                  +91 9259634802 |{'  '}
                  <FiGlobe className="text-green-400 text-xl mr-2" /> +91
                  9876543210
                </div>
              </div>
            </div>
            <div className="relative bg-white/5 backdrop-blur-lg rounded-2xl p-6 shadow-2xl transform transition-all duration-300 hover:scale-[1.02] animate-card-float-more-delayed border-l-4 border-orange-500 hover:border-orange-400 group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              <div className="flex items-center mb-4 relative z-10">
                <div className="p-3 bg-gradient-to-br from-orange-500/30 to-orange-700/30 rounded-xl">
                  <FiMail className="text-orange-400 text-2xl animate-pulse" />
                </div>
                <h3 className="ml-4 text-amber-100 text-xl font-semibold">
                  Email Addresses
                </h3>
              </div>
              <div className="pl-12 relative z-10">
                <p className="text-amber-100 font-semibold text-base sm:text-lg break-words">
                  dishdash.restora@gmail.com
                </p>
                <br />
                <p className="text-amber-100 font-semibold text-base sm:text-lg break-words">
                  hkpatel0045@gmail.com
                </p>
              </div>
            </div>
          </div>
          {/* Contact Form Section */}
          <div className="relative bg-white/5 backdrop-blur-lg rounded-2xl p-8 shadow-2xl animate-slide-in-right border-2 border-amber-500/30 hover:border-amber-500/50 transition-border duration-300">
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-amber-500/30 rounded-full animate-ping-slow"></div>
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {/* Profile Status Message */}
              {userProfile && (
                <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 text-green-300">
                    <FiUser className="text-lg" />
                    <span className="text-sm font-medium">
                      Profile information loaded! Contact details are pre-filled and secured.
                    </span>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="text-center py-8">
                  <div className="text-amber-400">Loading your profile...</div>
                </div>
              ) : (
                contactFormFields.map(
                  ({ label, name, type, placeholder, pattern, Icon, readOnly }) => (
                    <div key={name}>
                      <label className="block text-amber-100 text-sm font-medium mb-2">
                        {label}
                        {readOnly && (
                          <span className="ml-2 text-xs text-amber-400/60 bg-amber-500/20 px-2 py-1 rounded-full">
                            🔒 From Profile
                          </span>
                        )}
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <Icon className={`text-xl ${readOnly ? 'text-amber-400/60' : 'text-amber-500'} animate-pulse`} />
                        </div>
                        <input
                          type={type}
                          name={name}
                          value={formData[name]}
                          onChange={handleChange}
                          readOnly={readOnly}
                          className={`w-full pl-10 pr-4 py-3 rounded-xl text-amber-50 focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder-amber-200/50 transition-all ${
                            readOnly 
                              ? 'bg-white/5 border-2 border-amber-500/20 cursor-not-allowed text-amber-200' 
                              : 'bg-white/10 border-2 border-amber-500/30'
                          }`}
                          placeholder={readOnly ? 'Auto-filled from your profile' : placeholder}
                          pattern={pattern}
                          required
                        />
                        {readOnly && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-400/60 text-sm">
                            🔒
                          </div>
                        )}
                      </div>
                      {readOnly && (
                        <p className="text-xs text-amber-400/60 mt-1">
                          This information is secured from your profile and cannot be changed here.
                        </p>
                      )}
                    </div>
                  )
                )
              )}
              <div>
                <label className="block text-amber-100 text-sm font-medium mb-2">
                  Your Query
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-4">
                    <FiMessageSquare className="text-amber-500 text-xl animate-pulse" />
                  </div>
                  <textarea
                    rows="4"
                    name="query"
                    value={formData.query}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border-2 border-amber-500/30 rounded-xl text-amber-50 focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder-amber-200/50"
                    placeholder="Type your message here..."
                    required
                  ></textarea>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-amber-500/20 flex items-center justify-center space-x-2 group"
              >
                <span>Submit Query</span>
                <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
