// src/components/Admin/Customers.jsx
import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiShoppingBag, FiCalendar, FiEye } from 'react-icons/fi';
import { Link } from 'react-router-dom';  
import axios from 'axios';
import AdminNavbar from './AdminNavbar';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      console.log('Fetching customers...');
      
      // Fetch all users
      const usersResponse = await axios.get('http://localhost:4000/api/user/customers', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });
      
      console.log('Users response:', usersResponse.data);

      // Fetch all orders to calculate customer statistics
      const ordersResponse = await axios.get('http://localhost:4000/api/orders/getall', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });
      
      console.log('Orders response:', ordersResponse.data);

      const orders = ordersResponse.data;
      const users = usersResponse.data.success ? usersResponse.data.data : []; // Handle API response structure

      console.log('Processed users:', users);
      console.log('Processed orders:', orders);

      // Calculate customer statistics
      const customerStats = users.map(user => {
        console.log(`Processing user ${user.username} (${user._id})`);
        
        // Try both userId and user fields for matching
        const userOrders = orders.filter(order => {
          const orderUserId = order.userId || order.user;
          const match = orderUserId && (orderUserId === user._id || orderUserId.toString() === user._id.toString());
          if (match) {
            console.log(`Found matching order for ${user.username}:`, order);
          }
          return match;
        });
        
        console.log(`User ${user.username} has ${userOrders.length} orders:`, userOrders);
        
        const totalOrders = userOrders.length;
        const totalSpent = userOrders.reduce((sum, order) => {
          const orderTotal = order.total || 0;
          console.log(`Order ${order._id} total: ${orderTotal}`);
          return sum + orderTotal;
        }, 0);
        
        const lastOrder = userOrders.length > 0 ? 
          new Date(Math.max(...userOrders.map(o => new Date(o.createdAt)))).toLocaleDateString() : 
          'No orders';

        console.log(`Stats for ${user.username}: ${totalOrders} orders, ₹${totalSpent} spent`);

        return {
          ...user,
          totalOrders,
          totalSpent,
          lastOrder,
          orders: userOrders
        };
      });

      console.log('Customer stats:', customerStats);
      setCustomers(customerStats);
      setError(null);
    } catch (err) {
      console.error('Error fetching customers:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || err.message || 'Failed to load customers.');
    } finally {
      setLoading(false);
    }
  };

  const viewCustomerDetails = (customer) => {
    setSelectedCustomer(customer);
    setCustomerOrders(customer.orders);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCustomer(null);
    setCustomerOrders([]);
  };

  const debugFetchAllUsers = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/user/all');
      console.log('All users debug:', response.data);
      setDebugInfo(`All users: ${JSON.stringify(response.data, null, 2)}`);
    } catch (err) {
      console.error('Debug fetch error:', err);
      setDebugInfo(`Debug error: ${err.message}`);
    }
  };

  const testRegisterCustomer = async () => {
    try {
      const testCustomer = {
        username: 'Test Customer',
        email: 'test@customer.com',
        password: 'password123'
      };
      
      const response = await axios.post('http://localhost:4000/api/user/register', testCustomer);
      console.log('Test customer created:', response.data);
      setDebugInfo(`Test customer created: ${JSON.stringify(response.data, null, 2)}`);
      
      // Refresh customers after creating test user
      setTimeout(() => {
        fetchCustomers();
      }, 1000);
    } catch (err) {
      console.error('Test register error:', err);
      setDebugInfo(`Test register error: ${err.response?.data?.message || err.message}`);
    }
  };

  const updateExistingUsersWithRole = async () => {
    try {
      const response = await axios.post('http://localhost:4000/api/user/update-roles');
      console.log('Updated users with roles:', response.data);
      setDebugInfo(`Updated users: ${JSON.stringify(response.data, null, 2)}`);
      
      // Refresh customers after updating roles
      setTimeout(() => {
        fetchCustomers();
      }, 1000);
    } catch (err) {
      console.error('Update roles error:', err);
      setDebugInfo(`Update roles error: ${err.response?.data?.message || err.message}`);
    }
  };

  const layoutClasses = {
    page: 'min-h-screen bg-gradient-to-br from-[#1a120b] via-[#2a1e14] to-[#3e2b1d] py-12 px-4 sm:px-6 lg:px-8',
    card: 'bg-[#4b3b3b]/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-amber-500/20',
    heading: 'text-3xl font-bold mb-8 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent text-center',
  };

  const tableClasses = {
    wrapper: 'overflow-x-auto',
    table: 'w-full',
    headerRow: 'bg-[#3a2b2b]/50',
    headerCell: 'p-4 text-left text-amber-400',
    row: 'border-b border-amber-500/20 hover:bg-[#3a2b2b]/30 transition-colors group',
    cellBase: 'p-4',
  };

  if (loading) return (
    <>
      <AdminNavbar />
      <div className={layoutClasses.page + ' flex items-center justify-center'}>
        <div className="text-amber-400 text-xl">Loading customers...</div>
      </div>
    </>
  );

  if (error) return (
    <>
      <AdminNavbar />
      <div className={layoutClasses.page + ' flex items-center justify-center'}>
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    </>
  );

  return (
    <>
      <AdminNavbar />
      <div className={layoutClasses.page}>
        <div className="max-w-7xl mx-auto">
          <div className={layoutClasses.card}>
            <h2 className={layoutClasses.heading}>Customer Management</h2>
            
            {/* Debug Section
            <div className="mb-6 flex gap-4 flex-wrap">
              <button
                onClick={debugFetchAllUsers}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Debug: Fetch All Users
              </button>
              <button
                onClick={updateExistingUsersWithRole}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Fix User Roles
              </button>
              <button
                onClick={testRegisterCustomer}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Create Test Customer
              </button>
              <button
                onClick={fetchCustomers}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
              >
                Refresh Customers
              </button>
            </div>
            
            {debugInfo && (
              <div className="mb-6 p-4 bg-gray-800 text-green-300 rounded-lg text-sm font-mono max-h-40 overflow-auto">
                <pre>{debugInfo}</pre>
              </div>
            )} */}
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-amber-900/20 rounded-xl p-6 border border-amber-500/30">
                <div className="flex items-center gap-3">
                  <FiUser className="text-2xl text-amber-400" />
                  <div>
                    <p className="text-amber-100 text-sm">Total Customers</p>
                    <p className="text-2xl font-bold text-amber-300">{customers.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-amber-900/20 rounded-xl p-6 border border-amber-500/30">
                <div className="flex items-center gap-3">
                  <FiShoppingBag className="text-2xl text-green-400" />
                  <div>
                    <p className="text-amber-100 text-sm">Total Orders</p>
                    <p className="text-2xl font-bold text-green-300">
                      {customers.reduce((sum, c) => sum + c.totalOrders, 0)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-amber-900/20 rounded-xl p-6 border border-amber-500/30">
                <div className="flex items-center gap-3">
                  <span className="text-2xl text-blue-400">₹</span>
                  <div>
                    <p className="text-amber-100 text-sm">Total Revenue</p>
                    <p className="text-2xl font-bold text-blue-300">
                      ₹{customers.reduce((sum, c) => sum + c.totalSpent, 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className={tableClasses.wrapper}>
              <table className={tableClasses.table}>
                <thead className={tableClasses.headerRow}>
                  <tr>
                    <th className={tableClasses.headerCell}>Customer</th>
                    <th className={tableClasses.headerCell}>Email</th>
                    <th className={tableClasses.headerCell}>Total Orders</th>
                    <th className={tableClasses.headerCell}>Total Spent</th>
                    <th className={tableClasses.headerCell}>Last Order</th>
                    <th className={tableClasses.headerCell}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map(customer => (
                    <tr key={customer._id} className={tableClasses.row}>
                      <td className={tableClasses.cellBase}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center">
                            <FiUser className="text-white" />
                          </div>
                          <div>
                            <p className="text-amber-100 font-medium">{customer.username}</p>
                            <p className="text-amber-400/60 text-sm">ID: {customer._id.slice(-8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className={tableClasses.cellBase}>
                        <div className="flex items-center gap-2">
                          <FiMail className="text-amber-400" />
                          <span className="text-amber-100">{customer.email}</span>
                        </div>
                      </td>
                      <td className={tableClasses.cellBase}>
                        <div className="flex items-center gap-2">
                          <FiShoppingBag className="text-green-400" />
                          <span className="text-green-300 font-medium">{customer.totalOrders}</span>
                        </div>
                      </td>
                      <td className={tableClasses.cellBase}>
                        <span className="text-blue-300 font-medium">₹{customer.totalSpent.toFixed(2)}</span>
                      </td>
                      <td className={tableClasses.cellBase}>
                        <div className="flex items-center gap-2">
                          <FiCalendar className="text-amber-400" />
                          <span className="text-amber-100">{customer.lastOrder}</span>
                        </div>
                      </td>
                      <td className={tableClasses.cellBase}>
                        <button
                          onClick={() => viewCustomerDetails(customer)}
                          className="flex items-center gap-2 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                        >
                          <FiEye />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {customers.length === 0 && (
              <div className="text-center py-12 text-amber-100/60 text-xl">No customers found</div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Details Modal */}
      {showModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#2D1B0E] to-[#4a372a] rounded-xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto border-4 border-amber-700/30">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-amber-300">Customer Details</h3>
              <button
                onClick={closeModal}
                className="text-amber-500 hover:text-amber-300 text-2xl"
              >
                &times;
              </button>
            </div>

            {/* Customer Info */}
            <div className="bg-amber-900/20 rounded-xl p-6 mb-6 border border-amber-500/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-amber-400 text-sm">Name</p>
                  <p className="text-amber-100 font-medium">{selectedCustomer.username}</p>
                </div>
                <div>
                  <p className="text-amber-400 text-sm">Email</p>
                  <p className="text-amber-100 font-medium">{selectedCustomer.email}</p>
                </div>
                <div>
                  <p className="text-amber-400 text-sm">Total Orders</p>
                  <p className="text-green-300 font-bold text-lg">{selectedCustomer.totalOrders}</p>
                </div>
                <div>
                  <p className="text-amber-400 text-sm">Total Spent</p>
                  <p className="text-blue-300 font-bold text-lg">₹{selectedCustomer.totalSpent.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Order History */}
            <h4 className="text-xl font-bold text-amber-300 mb-4">Order History</h4>
            {customerOrders.length > 0 ? (
              <div className="space-y-4">
                {customerOrders.map(order => (
                  <div key={order._id} className="bg-[#3a2b2b]/50 rounded-lg p-4 border border-amber-500/20">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-amber-100 font-medium">Order #{order._id.slice(-8)}</p>
                        <p className="text-amber-400/60 text-sm">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-blue-300 font-bold">₹{order.total?.toFixed(2) || '0.00'}</p>
                        <p className="text-amber-400 text-sm capitalize">{order.status}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {order.items?.map((item, idx) => (
                        <span key={idx} className="bg-amber-900/30 text-amber-200 px-2 py-1 rounded text-sm">
                          {item.item?.name} x{item.quantity}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-amber-100/60 text-center py-8">No orders found</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Customers;