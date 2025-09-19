// src/components/Admin/ListItems.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiTrash2, FiStar, FiHeart, FiEdit, FiSave, FiX, FiUpload } from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';
import AdminNavbar from './AdminNavbar';

const ListItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [categories] = useState([
    'Breakfast', 'Lunch', 'Dinner', 'Mexican', 'Italian', 'Desserts', 'Drinks'
  ]);

  // Fetch items from API
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data } = await axios.get('http://localhost:4000/api/items');
        setItems(data);
      } catch (err) {
        console.error('Error fetching items:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // Delete handler
  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await axios.delete(`http://localhost:4000/api/items/${itemId}`);
      setItems(prev => prev.filter(item => item._id !== itemId));
      console.log('Deleted item ID:', itemId);
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  // Edit handlers
  const handleEdit = (item) => {
    setEditingItem(item._id);
    setEditForm({
      name: item.name,
      description: item.description,
      category: item.category,
      price: item.price,
      rating: item.rating,
      hearts: item.hearts,
      image: null,
      preview: item.imageUrl
    });
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditForm({});
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditForm(prev => ({
        ...prev,
        image: file,
        preview: URL.createObjectURL(file)
      }));
    }
  };

  const handleRatingChange = (rating) => {
    setEditForm(prev => ({ ...prev, rating }));
  };

  const handleUpdate = async (itemId) => {
    try {
      const formData = new FormData();
      Object.entries(editForm).forEach(([key, value]) => {
        if (key === 'preview') return;
        if (key === 'image' && !value) return;
        formData.append(key, value);
      });

      const response = await axios.put(`http://localhost:4000/api/items/${itemId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        // Update the item in the list
        setItems(prev => prev.map(item => 
          item._id === itemId ? response.data.item : item
        ));
        setEditingItem(null);
        setEditForm({});
      }
    } catch (err) {
      console.error('Error updating item:', err);
      alert('Failed to update item');
    }
  };

  const renderStars = (rating) =>
    [...Array(5)].map((_, i) => (
      <FiStar
        key={i}
        className={`text-xl ${i < rating ? 'text-amber-400 fill-current' : 'text-amber-100/30'}`}
      />
    ));

  const styles = {
    pageWrapper: "min-h-screen bg-gradient-to-br from-[#1a120b] via-[#2a1e14] to-[#3e2b1d] py-12 px-4 sm:px-6 lg:px-8",
    cardContainer: "bg-[#4b3b3b]/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-amber-500/20",
    title: "text-3xl font-bold mb-8 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent text-center",
    tableWrapper: "overflow-x-auto",
    table: "w-full",
    thead: "bg-[#3a2b2b]/50",
    th: "p-4 text-left text-amber-400",
    thCenter: "p-4 text-center text-amber-400",
    tr: "border-b border-amber-500/20 hover:bg-[#3a2b2b]/30 transition-colors",
    imgCell: "p-4",
    img: "w-50 h-30 object-contain rounded-lg",
    nameCell: "p-4",
    nameText: "text-amber-100 font-medium text-lg",
    descText: "text-sm text-amber-100/60",
    categoryCell: "p-4 text-amber-100/80",
    priceCell: "p-4 text-amber-300 font-medium",
    ratingCell: "p-4",
    heartsCell: "p-4",
    heartsWrapper: "flex items-center gap-2 text-amber-400",
    deleteBtn: "text-amber-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-900/20",
    emptyState: "text-center py-12 text-amber-100/60 text-xl",
  };

  if (loading) {
    return (
      <>
        <AdminNavbar />
        <div className="min-h-screen bg-gradient-to-br from-[#1a120b] via-[#2a1e14] to-[#3e2b1d] flex items-center justify-center text-amber-100">
          Loading menu…
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNavbar />
      <div className={styles.pageWrapper}>
        <div className="max-w-7xl mx-auto">
          <div className={styles.cardContainer}>
            <h2 className={styles.title}>Manage Menu Items</h2>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead className={styles.thead}>
                  <tr>
                    <th className={styles.th}>Image</th>
                    <th className={styles.th}>Name</th>
                    <th className={styles.th}>Category</th>
                    <th className={styles.th}>Price (₹)</th>
                    <th className={styles.th}>Rating</th>
                    <th className={styles.th}>Hearts</th>
                    <th className={styles.thCenter}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item._id} className={styles.tr}>
                      <td className={styles.imgCell}>
                        {editingItem === item._id ? (
                          <div className="w-20 h-16 relative">
                            <img
                              src={editForm.preview}
                              alt={item.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <label className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer rounded-lg">
                              <FiUpload className="text-white" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                              />
                            </label>
                          </div>
                        ) : (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className={styles.img}
                          />
                        )}
                      </td>
                      <td className={styles.nameCell}>
                        {editingItem === item._id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              name="name"
                              value={editForm.name}
                              onChange={handleFormChange}
                              className="w-full bg-[#3a2b2b] border border-amber-500/30 rounded px-2 py-1 text-amber-100"
                            />
                            <textarea
                              name="description"
                              value={editForm.description}
                              onChange={handleFormChange}
                              rows="2"
                              className="w-full bg-[#3a2b2b] border border-amber-500/30 rounded px-2 py-1 text-amber-100 text-sm"
                            />
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className={styles.nameText}>{item.name}</p>
                            <p className={styles.descText}>{item.description}</p>
                          </div>
                        )}
                      </td>
                      <td className={styles.categoryCell}>
                        {editingItem === item._id ? (
                          <select
                            name="category"
                            value={editForm.category}
                            onChange={handleFormChange}
                            className="bg-[#3a2b2b] border border-amber-500/30 rounded px-2 py-1 text-amber-100"
                          >
                            {categories.map(cat => (
                              <option key={cat} value={cat} className="bg-[#3a2b2b]">
                                {cat}
                              </option>
                            ))}
                          </select>
                        ) : (
                          item.category
                        )}
                      </td>
                      <td className={styles.priceCell}>
                        {editingItem === item._id ? (
                          <div className="relative">
                            <FaRupeeSign className="absolute left-2 top-1/2 -translate-y-1/2 text-amber-500" />
                            <input
                              type="number"
                              name="price"
                              value={editForm.price}
                              onChange={handleFormChange}
                              min="0"
                              step="0.01"
                              className="w-20 bg-[#3a2b2b] border border-amber-500/30 rounded pl-6 pr-2 py-1 text-amber-100"
                            />
                          </div>
                        ) : (
                          `₹${item.price}`
                        )}
                      </td>
                      <td className={styles.ratingCell}>
                        {editingItem === item._id ? (
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => handleRatingChange(star)}
                                className="text-lg transition-transform hover:scale-110"
                              >
                                <FiStar
                                  className={
                                    star <= editForm.rating
                                      ? 'text-amber-400 fill-current'
                                      : 'text-amber-100/30'
                                  }
                                />
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="flex gap-1">{renderStars(item.rating)}</div>
                        )}
                      </td>
                      <td className={styles.heartsCell}>
                        {editingItem === item._id ? (
                          <div className="flex items-center gap-2">
                            <FiHeart className="text-amber-400" />
                            <input
                              type="number"
                              name="hearts"
                              value={editForm.hearts}
                              onChange={handleFormChange}
                              min="0"
                              className="w-16 bg-[#3a2b2b] border border-amber-500/30 rounded px-2 py-1 text-amber-100"
                            />
                          </div>
                        ) : (
                          <div className={styles.heartsWrapper}>
                            <FiHeart className="text-xl" />
                            <span>{item.hearts}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {editingItem === item._id ? (
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleUpdate(item._id)}
                              className="text-green-400 hover:text-green-300 p-2 rounded-lg hover:bg-green-900/20"
                            >
                              <FiSave className="text-xl" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-900/20"
                            >
                              <FiX className="text-xl" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-900/20"
                            >
                              <FiEdit className="text-xl" />
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className={styles.deleteBtn}
                            >
                              <FiTrash2 className="text-xl" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {items.length === 0 && (
              <div className={styles.emptyState}>
                No items found in the menu
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ListItems;