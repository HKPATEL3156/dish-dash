// src/components/Admin/AdminNavbar.jsx
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiMenu,
  FiX,
  FiLogOut
} from 'react-icons/fi';
import { GiChefToque } from 'react-icons/gi';
import { MdOutlineAdd, MdOutlineList, MdOutlineShoppingCart, MdOutlinePeople } from 'react-icons/md';

const navLinks = [
  { name: 'Add Items', href: '/admin', icon: <MdOutlineAdd /> },
  { name: 'List Items', href: '/admin/list', icon: <MdOutlineList /> },
  { name: 'Orders', href: '/admin/orders', icon: <MdOutlineShoppingCart /> },
  { name: 'Customers', href: '/admin/customers', icon: <MdOutlinePeople /> },
];

const AdminNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('loginData');
    navigate('/');
  };

  const styles = {
    navWrapper: "bg-amber-900 shadow-lg border-b border-amber-700",
    navContainer: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between",
    logoSection: "flex items-center space-x-3",
    logoIcon: "text-2xl text-amber-200",
    logoText: "text-xl font-bold text-amber-100",
    menuButton: "lg:hidden text-amber-200 hover:text-amber-100 transition-colors",
    desktopMenu: "hidden lg:flex items-center space-x-1",
    mobileMenu: "lg:hidden bg-amber-800 border-t border-amber-700 px-4 py-2 space-y-1",
    navLinkBase: "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
    navLinkActive: "bg-amber-800 text-amber-100",
    navLinkInactive: "text-amber-200 hover:bg-amber-800 hover:text-amber-100",
    logoutButton: "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-amber-200 hover:bg-amber-800 hover:text-amber-100 transition-colors cursor-pointer"
  };

  return (
    <nav className={styles.navWrapper}>
      <div className={styles.navContainer}>
        <div className={styles.logoSection}>
          <GiChefToque className={styles.logoIcon} />
          <span className={styles.logoText}>DishDash Admin</span>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={styles.menuButton}
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>

        <div className={styles.desktopMenu}>
          {navLinks.map(link => (
            <NavLink
              key={link.name}
              to={link.href}
              className={({ isActive }) =>
                `${styles.navLinkBase} ${isActive ? styles.navLinkActive : styles.navLinkInactive
                }`
              }
            >
              {link.icon}
              <span>{link.name}</span>
            </NavLink>
          ))}
          <div onClick={handleLogout} className={styles.logoutButton}>
            <FiLogOut />
            <span>Logout</span>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          {navLinks.map(link => (
            <NavLink
              key={link.name}
              to={link.href}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `${styles.navLinkBase} ${isActive ? styles.navLinkActive : styles.navLinkInactive
                }`
              }
            >
              {link.icon}
              <span>{link.name}</span>
            </NavLink>
          ))}
          <div onClick={handleLogout} className={styles.logoutButton}>
            <FiLogOut />
            <span>Logout</span>
          </div>
        </div>
      )}
    </nav>
  );
};

export default AdminNavbar;