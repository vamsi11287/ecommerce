import React, { useState, useEffect } from 'react';
import '../../styles/StaffManagement.css';

const StaffManagement = ({ showNotification }) => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        fullName: '',
        role: 'staff',
        phone: '',
        email: ''
    });

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/auth/staff', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setStaff(data.data);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching staff:', error);
            showNotification('Error loading staff', 'error');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const url = editingStaff 
                ? `http://localhost:5000/api/auth/staff/${editingStaff._id}`
                : 'http://localhost:5000/api/auth/register';
            
            const method = editingStaff ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (data.success) {
                showNotification(
                    editingStaff ? 'Staff updated successfully' : 'Staff added successfully',
                    'success'
                );
                fetchStaff();
                handleCloseModal();
            } else {
                showNotification(data.message || 'Operation failed', 'error');
            }
        } catch (error) {
            console.error('Error saving staff:', error);
            showNotification('Error saving staff', 'error');
        }
    };

    const handleDelete = async (staffId) => {
        if (!window.confirm('Are you sure you want to delete this staff member?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/auth/staff/${staffId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            
            if (data.success) {
                showNotification('Staff deleted successfully', 'success');
                fetchStaff();
            } else {
                showNotification(data.message || 'Delete failed', 'error');
            }
        } catch (error) {
            console.error('Error deleting staff:', error);
            showNotification('Error deleting staff', 'error');
        }
    };

    const handleEdit = (staffMember) => {
        setEditingStaff(staffMember);
        setFormData({
            username: staffMember.username,
            password: '',
            fullName: staffMember.fullName || '',
            role: staffMember.role,
            phone: staffMember.phone || '',
            email: staffMember.email || ''
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingStaff(null);
        setFormData({
            username: '',
            password: '',
            fullName: '',
            role: 'staff',
            phone: '',
            email: ''
        });
    };

    const getRoleBadge = (role) => {
        const badges = {
            'owner': { icon: '👑', color: '#f39c12', label: 'Owner' },
            'staff': { icon: '👤', color: '#3498db', label: 'Staff' },
            'kitchen': { icon: '👨‍🍳', color: '#e74c3c', label: 'Kitchen' }
        };
        return badges[role] || badges['staff'];
    };

    if (loading) {
        return <div className="loading">Loading staff...</div>;
    }

    return (
        <div className="staff-management">
            <div className="staff-header">
                <h2>👥 Staff Management</h2>
                <button className="btn-add-staff" onClick={() => setShowModal(true)}>
                    ➕ Add Staff
                </button>
            </div>

            <div className="staff-grid">
                {staff.map((member) => {
                    const badge = getRoleBadge(member.role);
                    return (
                        <div key={member._id} className="staff-card">
                            <div className="staff-card-header">
                                <div className="staff-avatar">{badge.icon}</div>
                                <span 
                                    className="staff-role-badge"
                                    style={{ backgroundColor: badge.color }}
                                >
                                    {badge.label}
                                </span>
                            </div>
                            <div className="staff-card-body">
                                <h3>{member.fullName || member.username}</h3>
                                <p className="staff-username">@{member.username}</p>
                                {member.email && <p className="staff-detail">📧 {member.email}</p>}
                                {member.phone && <p className="staff-detail">📱 {member.phone}</p>}
                                <p className="staff-date">Joined: {new Date(member.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="staff-card-actions">
                                <button 
                                    className="btn-edit"
                                    onClick={() => handleEdit(member)}
                                    disabled={member.role === 'owner'}
                                >
                                    ✏️ Edit
                                </button>
                                <button 
                                    className="btn-delete"
                                    onClick={() => handleDelete(member._id)}
                                    disabled={member.role === 'owner'}
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {staff.length === 0 && (
                <div className="no-staff">
                    <p>No staff members found</p>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingStaff ? '✏️ Edit Staff' : '➕ Add New Staff'}</h2>
                            <button className="btn-close" onClick={handleCloseModal}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Username *</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    required
                                    disabled={editingStaff}
                                />
                            </div>
                            <div className="form-group">
                                <label>Password {editingStaff ? '(Leave blank to keep current)' : '*'}</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    required={!editingStaff}
                                />
                            </div>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Role *</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                    required
                                >
                                    <option value="staff">Staff</option>
                                    <option value="kitchen">Kitchen</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-submit">
                                    {editingStaff ? 'Update' : 'Add'} Staff
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffManagement;
