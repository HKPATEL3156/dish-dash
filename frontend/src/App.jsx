import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Cart from './pages/Cart/Cart';
import SignUp from './components/SignUp/SignUp';
import ContactPage from './pages/ContactPage/ContactPage';
import CheckoutPage from './pages/Checkout/Checkout';
import AboutPage from './pages/AboutPage/AboutPage';
import Menu from './pages/Menu/Menu';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import AdminRoute from './components/AdminRoute/AdminRoute';
import MyOrders from './pages/MyOredrs/MyOrders';
import VerifyPaymentPage from './pages/VerifyPaymentPage/VerifyPaymentPage';

// Admin Components
import AdminLayout from './pages/Admin/AdminLayout';
import AddItems from './components/Admin/AddItems';
import ListItems from './components/Admin/ListItems';
import Orders from './components/Admin/Orders';
import Customers from './components/Admin/Customers';

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Home />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/menu" element={<Menu />} />

      {/* Payment verification */}
      <Route path="/myorder/verify" element={<VerifyPaymentPage />} />

      {/* Protected Customer Routes */}
      <Route
        path="/cart"
        element={<PrivateRoute><Cart /></PrivateRoute>}
      />
      <Route
        path="/checkout"
        element={<PrivateRoute><CheckoutPage /></PrivateRoute>}
      />
      <Route
        path="/myorder"
        element={<PrivateRoute><MyOrders /></PrivateRoute>}
      />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AddItems />} />
        <Route path="list" element={<ListItems />} />
        <Route path="orders" element={<Orders />} />
        <Route path="customers" element={<Customers />} />
      </Route>
    </Routes>
  );
}

export default App;
