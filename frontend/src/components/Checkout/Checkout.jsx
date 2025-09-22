import React, { useState, useEffect } from 'react';
import { useCart } from '../../CartContext/CartContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaLock } from 'react-icons/fa';
import axios from 'axios';

const CheckoutPage = () => {
  const { totalAmount, cartItems: rawCart, clearCart } = useCart();
  const cartItems = rawCart.filter((ci) => ci.item);
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    paymentMethod: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // Grab token from localStorage
  const token = localStorage.getItem('authToken');
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  // Fetch user profile to pre-fill form
  useEffect(() => {
    const fetchUserProfile = async () => {
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
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            email: profile.email || '',
            phone: profile.phone || '',
            address: profile.address || '',
            city: profile.city || '',
            zipCode: profile.zipCode || ''
          }));
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // If profile fetch fails, we'll just continue with empty form
      }
    };

    if (token) {
      fetchUserProfile();
    }
  }, [token]);

  // Handle redirect back from payment gateway
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paymentStatus = params.get('payment_status');
    const sessionId = params.get('session_id');

    if (paymentStatus) {
      setLoading(true);
      if (paymentStatus === 'success' && sessionId) {
        // Confirm the payment and create order on the backend
        axios
          .post(
            'http://localhost:4000/api/orders/confirm',
            { sessionId },
            { headers: authHeaders }
          )
          .then(({ data }) => {
            // Only clear cart when payment truly succeeded
            clearCart();
            navigate('/myorder', { state: { order: data.order } });
          })
          .catch((err) => {
            console.error('Payment confirmation error:', err);
            setError(
              'Payment confirmation failed. Please contact support.' +
                err.message +
                ' ' +
                err.response?.data?.message +
                ' ' +
                err.response?.status
            );
          })
          .finally(() => setLoading(false));
      } else if (paymentStatus === 'cancel') {
        // User cancelled or payment failed
        setError(
          'Payment was cancelled or failed. Your cart remains intact. Please try again. '
        );
        setLoading(false);
      }
    }
  }, [location.search, clearCart, navigate, authHeaders]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // calculate pricing
    const subtotal = Number(totalAmount.toFixed(2));
    const tax = Number((subtotal * 0.05).toFixed(2));

    const payload = {
      ...formData,
      subtotal,
      tax,
      total: Number((subtotal + tax).toFixed(2)),
      items: cartItems.map(({ item, quantity }) => ({
        name: item.name,
        price: item.price,
        quantity,
        imageUrl: item.imageUrl || '',
      })),
    };

    try {
      if (formData.paymentMethod === 'online') {
        // Initiate payment session; do NOT create order or clear cart yet
        const { data } = await axios.post(
          'http://localhost:4000/api/orders',
          payload,
          { headers: authHeaders }
        );
        // Redirect to external payment gateway
        window.location.href = data.checkoutUrl;
      } else {
        // Cash on Delivery: directly create order
        const { data } = await axios.post(
          'http://localhost:4000/api/orders',
          payload,
          { headers: authHeaders }
        );
        clearCart();
        navigate('/myorder', { state: { order: data.order } });
      }
    } catch (err) {
      console.error('Order submission error:', err);
      setError(err.response?.data?.message || 'Failed to submit order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1212] to-[#2a1e1e] text-white py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/cart"
          className="flex items-center gap-2 text-amber-400 mb-8"
        >
          <FaArrowLeft /> Back to Cart
        </Link>
        <h1 className="text-4xl font-bold text-center mb-8">Checkout</h1>
        <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-12">
          {/* Personal Info Section */}
          <div className="bg-[#4b3b3b]/80 p-6 rounded-3xl space-y-6">
            <h2 className="text-2xl font-bold">Personal Information</h2>
            
            {/* Profile Message */}
            {userProfile && (
              <div className="bg-amber-600/10 border border-amber-500/30 rounded-lg p-3 text-amber-300 text-sm">
                📋 Pre-filled from your profile. You can edit delivery details below.
              </div>
            )}
            
            <Input
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              readOnly={true}
              icon="👤"
            />
            <Input
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              readOnly={true}
              icon="👤"
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              readOnly={true}
              icon="📧"
            />
            
            <div className="border-t border-amber-500/20 pt-4">
              <h3 className="text-lg font-semibold text-amber-300 mb-4">Delivery Details (Editable)</h3>
              
              <div className="space-y-4">
                <Input
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  icon="📱"
                  placeholder="Enter delivery contact number"
                />
                <Input
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  icon="🏠"
                  placeholder="Enter delivery address"
                />
                <Input
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  icon="🏙️"
                  placeholder="Enter city"
                />
                <Input
                  label="Zip Code"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  icon="📮"
                  placeholder="Enter zip code"
                />
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-[#4b3b3b]/80 p-6 rounded-3xl space-y-6">
            <h2 className="text-2xl font-bold">Payment Details</h2>

            {/* Order Items */}
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-semibold text-amber-100">
                Your Order Items
              </h3>
              {cartItems.map(({ _id, item, quantity }) => (
                <div
                  key={_id}
                  className="flex justify-between items-center bg-[#3a2b2b]/50 p-3 rounded-lg"
                >
                  <div className="flex-1">
                    <span className="text-amber-100">{item.name}</span>
                    <span className="ml-2 text-amber-500/80 text-sm">
                      x{quantity}
                    </span>
                  </div>
                  <span className="text-amber-300">
                    ₹{(item.price * quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <PaymentSummary totalAmount={totalAmount} />

            {/* Payment Method */}
            <div>
              <label className="block mb-2">Payment Method</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                required
                className="w-full bg-[#3a2b2b]/50 rounded-xl px-4 py-3"
              >
                <option value="">Select Method</option>
                <option value="cod">Cash on Delivery</option>
                <option value="online">Online Payment</option>
              </select>
            </div>

            {error && <p className="text-red-400 mt-2">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-amber-600 py-4 rounded-xl font-bold flex justify-center items-center"
            >
              <FaLock className="mr-2" />{' '}
              {loading ? 'Processing...' : 'Complete Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Input = ({ label, name, type = 'text', value, onChange, readOnly = false, icon, placeholder }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-amber-300">{label}</label>
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400 text-sm">
          {icon}
        </span>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={readOnly ? undefined : onChange}
        required
        readOnly={readOnly}
        placeholder={placeholder}
        className={`w-full rounded-xl px-4 py-3 transition-colors ${
          icon ? 'pl-10' : ''
        } ${
          readOnly 
            ? 'bg-[#3a2b2b]/30 text-amber-200 cursor-not-allowed border border-amber-500/20' 
            : 'bg-[#3a2b2b]/50 text-white border border-amber-500/20 focus:border-amber-400 focus:outline-none'
        }`}
      />
      {readOnly && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-400/60 text-xs">
          🔒
        </div>
      )}
    </div>
    {readOnly && (
      <p className="text-xs text-amber-400/60">This field is from your profile and cannot be changed during checkout</p>
    )}
  </div>
);

const PaymentSummary = ({ totalAmount }) => {
  const subtotal = Number(totalAmount.toFixed(2));
  const tax = Number((subtotal * 0.05).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span>Subtotal:</span>
        <span>₹{subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span>Tax (5%):</span>
        <span>₹{tax.toFixed(2)}</span>
      </div>
      <div className="flex justify-between font-bold border-t pt-2">
        <span>Total:</span>
        <span>₹{total.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default CheckoutPage;
