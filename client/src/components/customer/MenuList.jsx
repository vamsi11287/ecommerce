import React, { useState } from 'react';
import '../../styles/MenuList.css';

const MenuList = ({ menuItems, onAddToCart }) => {
    const [selectedCategory, setSelectedCategory] = useState('all');

    const categories = ['all', ...new Set(menuItems.map(item => item.category))];

    const filteredItems = selectedCategory === 'all' 
        ? menuItems 
        : menuItems.filter(item => item.category === selectedCategory);

    return (
        <div className="menu-list">
            <div className="category-filter">
                {categories.map(category => (
                    <button
                        key={category}
                        className={selectedCategory === category ? 'active' : ''}
                        onClick={() => setSelectedCategory(category)}
                    >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                ))}
            </div>

            {filteredItems.length === 0 ? (
                <div className="no-items">
                    <p>🍴 No items available in this category</p>
                </div>
            ) : (
                <div className="menu-grid">
                    {filteredItems.map(item => (
                        <div key={item._id} className="menu-item">
                            {item.imageUrl && (
                                <div className="menu-item-image">
                                    <img 
                                        src={item.imageUrl.startsWith('http') ? item.imageUrl : `http://localhost:5000${item.imageUrl}`} 
                                        alt={item.name}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}
                            <div className="menu-item-info">
                                <h3>{item.name}</h3>
                                {item.description && (
                                    <p className="description">{item.description}</p>
                                )}
                                <div className="menu-item-footer">
                                    <span className="price">${item.price.toFixed(2)}</span>
                                    <button 
                                        onClick={() => onAddToCart(item)}
                                        className="btn-add"
                                    >
                                        Add +
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MenuList;