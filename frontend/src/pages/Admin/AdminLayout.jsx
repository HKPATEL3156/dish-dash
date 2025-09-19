// src/pages/Admin/AdminLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a120b] via-[#2a1e14] to-[#3e2b1d]">
      <Outlet />
    </div>
  );
};

export default AdminLayout;