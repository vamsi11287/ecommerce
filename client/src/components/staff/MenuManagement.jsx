import React, { useState, useEffect } from 'react';
import '../../styles/MenuManagement.css';

const MenuManagement = ({ showNotification }) => {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Main Course',
        isAvailable: true,
        imageUrl: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    const categories = [
        'Appetizer',
        'Main Course',
        'Dessert',
        'Beverage',
        'Side Dish',
        'Special'
    ];

    useEffect(() => {
        fetchMenuItems();
    }, []);

    const fetchMenuItems = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/menu', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setMenuItems(data.data);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching menu items:', error);
            showNotification('Error loading menu items', 'error');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            
            let finalImageUrl = formData.imageUrl;
            
            // If there's a new image file, upload it first
            if (imageFile) {
                const imageFormData = new FormData();
                imageFormData.append('image', imageFile);
                
                const uploadResponse = await fetch('http://localhost:5000/api/menu/upload-image', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: imageFormData
                });
                
                const uploadData = await uploadResponse.json();
                if (uploadData.success) {
                    finalImageUrl = uploadData.data.imageUrl;
                } else {
                    showNotification(uploadData.message || 'Image upload failed', 'error');
                    return;
                }
            }
            
            const url = editingItem 
                ? `http://localhost:5000/api/menu/${editingItem._id}`
                : 'http://localhost:5000/api/menu';
            
            const method = editingItem ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    imageUrl: finalImageUrl
                })
            });

            const data = await response.json();
            
            if (data.success) {
                showNotification(
                    editingItem ? 'Menu item updated successfully' : 'Menu item added successfully',
                    'success'
                );
                fetchMenuItems();
                handleCloseModal();
            } else {
                showNotification(data.message || 'Operation failed', 'error');
            }
        } catch (error) {
            console.error('Error saving menu item:', error);
            showNotification('Error saving menu item', 'error');
        }
    };

    const handleDelete = async (itemId) => {
        if (!window.confirm('Are you sure you want to delete this menu item?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/menu/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            
            if (data.success) {
                showNotification('Menu item deleted successfully', 'success');
                fetchMenuItems();
            } else {
                showNotification(data.message || 'Delete failed', 'error');
            }
        } catch (error) {
            console.error('Error deleting menu item:', error);
            showNotification('Error deleting menu item', 'error');
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            description: item.description || '',
            price: item.price.toString(),
            category: item.category,
            isAvailable: item.isAvailable,
            imageUrl: item.imageUrl || ''
        });
        const previewUrl = item.imageUrl 
            ? (item.imageUrl.startsWith('http') ? item.imageUrl : `http://localhost:5000${item.imageUrl}`)
            : '';
        setImagePreview(previewUrl);
        setImageFile(null);
        setShowModal(true);
    };

    const handleToggleAvailability = async (item) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/menu/${item._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...item,
                    isAvailable: !item.isAvailable
                })
            });

            const data = await response.json();
            
            if (data.success) {
                showNotification(
                    `${item.name} is now ${!item.isAvailable ? 'available' : 'unavailable'}`,
                    'success'
                );
                fetchMenuItems();
            } else {
                showNotification(data.message || 'Update failed', 'error');
            }
        } catch (error) {
            console.error('Error updating availability:', error);
            showNotification('Error updating availability', 'error');
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingItem(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            category: 'Main Course',
            isAvailable: true,
            imageUrl: ''
        });
        setImageFile(null);
        setImagePreview('');
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                showNotification('Image size should be less than 5MB', 'error');
                return;
            }
            
            if (!file.type.startsWith('image/')) {
                showNotification('Please select an image file', 'error');
                return;
            }
            
            setImageFile(file);
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview('');
        setFormData({...formData, imageUrl: ''});
    };

    const getCategoryIcon = (category) => {
        const icons = {
            'Appetizer': '🥗',
            'Main Course': '🍽️',
            'Dessert': '🍰',
            'Beverage': '🥤',
            'Side Dish': '🍟',
            'Special': '⭐'
        };
        return icons[category] || '🍴';
    };

    const groupedItems = menuItems.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
    }, {});

    // Get all unique categories from actual items, plus predefined ones
    const allCategories = [...new Set([...categories, ...Object.keys(groupedItems)])];

    if (loading) {
        return <div className="loading">Loading menu items...</div>;
    }

    return (
        <div className="menu-management">
            <div className="menu-header">
                <h2>🍽️ Menu Management</h2>
                <button className="btn-add-item" onClick={() => setShowModal(true)}>
                    ➕ Add Menu Item
                </button>
            </div>

            <div className="menu-stats">
                <div className="stat-item">
                    <span className="stat-label">Total Items</span>
                    <span className="stat-value">{menuItems.length}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Available</span>
                    <span className="stat-value available">{menuItems.filter(i => i.isAvailable).length}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Unavailable</span>
                    <span className="stat-value unavailable">{menuItems.filter(i => !i.isAvailable).length}</span>
                </div>
            </div>

            {menuItems.length === 0 ? (
                <div className="no-items">
                    <p>📭 No menu items found</p>
                    <button className="btn-add-first" onClick={() => setShowModal(true)}>
                        Add Your First Item
                    </button>
                </div>
            ) : (
                <div className="menu-categories">
                    {allCategories.map(category => {
                        const items = groupedItems[category] || [];
                        if (items.length === 0) return null;

                        return (
                            <div key={category} className="category-section">
                                <h3 className="category-title">
                                    {getCategoryIcon(category)} {category}
                                    <span className="category-count">({items.length})</span>
                                </h3>
                                <div className="items-grid">
                                    {items.map((item) => (
                                        <div key={item._id} className={`menu-item-card ${!item.isAvailable ? 'unavailable' : ''}`}>
                                            {item.imageUrl && (
                                                <div className="item-image">
                                                    <img 
                                                        src={item.imageUrl.startsWith('http') ? item.imageUrl : `http://localhost:5000${item.imageUrl}`} 
                                                        alt={item.name}
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.parentElement.style.display = 'none';
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            <div className="item-header">
                                                <h4>{item.name}</h4>
                                                <span className="item-price">${item.price.toFixed(2)}</span>
                                            </div>
                                            {item.description && (
                                                <p className="item-description">{item.description}</p>
                                            )}
                                            <div className="item-footer">
                                                <div className="availability-toggle">
                                                    <label className="toggle-switch">
                                                        <input
                                                            type="checkbox"
                                                            checked={item.isAvailable}
                                                            onChange={() => handleToggleAvailability(item)}
                                                        />
                                                        <span className="toggle-slider"></span>
                                                    </label>
                                                    <span className="availability-label">
                                                        {item.isAvailable ? '✅ Available' : '❌ Unavailable'}
                                                    </span>
                                                </div>
                                                <div className="item-actions">
                                                    <button 
                                                        className="btn-edit-item"
                                                        onClick={() => handleEdit(item)}
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button 
                                                        className="btn-delete-item"
                                                        onClick={() => handleDelete(item._id)}
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingItem ? '✏️ Edit Menu Item' : '➕ Add Menu Item'}</h2>
                            <button className="btn-close" onClick={handleCloseModal}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Item Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required
                                    placeholder="e.g., Margherita Pizza"
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder="Describe the item..."
                                    rows="3"
                                />
                            </div>
                            <div className="form-group">
                                <label>Image</label>
                                <div className="image-upload-section">
                                    {imagePreview ? (
                                        <div className="image-preview-container">
                                            <img src={imagePreview} alt="Preview" className="image-preview" />
                                            <button 
                                                type="button" 
                                                className="btn-remove-image"
                                                onClick={handleRemoveImage}
                                            >
                                                ✕ Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="image-upload-box">
                                            <input
                                                type="file"
                                                id="image-upload"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                style={{ display: 'none' }}
                                            />
                                            <label htmlFor="image-upload" className="upload-label">
                                                📷 Click to upload image
                                                <span className="upload-hint">Max size: 5MB</span>
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Price *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.price}
                                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                                        required
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Category *</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                                        required
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>
                                                {getCategoryIcon(cat)} {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.isAvailable}
                                        onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
                                    />
                                    <span>Available for ordering</span>
                                </label>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-submit">
                                    {editingItem ? 'Update' : 'Add'} Item
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MenuManagement;
