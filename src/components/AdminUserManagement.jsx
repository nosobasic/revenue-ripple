import React, { useState, useEffect } from 'react';
import { UserService } from '../services/userService';
import { User } from '../types/user';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    first_name: '',
    last_name: '',
    role: 'member',
    status: 'active'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersData = await UserService.getAllUsers();
      setUsers(usersData);
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      name: '',
      first_name: '',
      last_name: '',
      role: 'member',
      status: 'active'
    });
    setEditingUser(null);
    setShowAddUser(false);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!formData.email || !formData.password) {
        throw new Error('Email and password are required');
      }

      // Create full name from first/last name if provided
      const fullName = formData.first_name && formData.last_name 
        ? `${formData.first_name} ${formData.last_name}`
        : formData.name;

      const newUser = await UserService.createUser({
        email: formData.email,
        password: formData.password,
        name: fullName,
        role: formData.role,
        status: formData.status
      });

      setUsers(prev => [newUser, ...prev]);
      setSuccess(`User ${formData.email} created successfully!`);
      resetForm();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to create user');
      console.error('Error creating user:', err);
    }
  };

  const handleUpdateUserRole = async (userId, newRole, newStatus) => {
    try {
      await UserService.updateUserRole(userId, newRole, newStatus);
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, role: newRole, status: newStatus || user.status }
          : user
      ));
      setSuccess('User updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update user');
      console.error('Error updating user:', err);
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (!confirm(`Are you sure you want to delete user ${userEmail}? This action cannot be undone.`)) {
      return;
    }

    try {
      await UserService.deleteUser(userId);
      setUsers(prev => prev.filter(user => user.id !== userId));
      setSuccess('User deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete user');
      console.error('Error deleting user:', err);
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: '#ef4444',
      pro_reseller: '#8b5cf6',
      reseller: '#06b6d4',
      affiliate: '#10b981',
      member: '#6b7280'
    };
    return colors[role] || '#6b7280';
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      active: '#10b981',
      inactive: '#f59e0b',
      suspended: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  if (loading) {
    return <div className="loading-spinner">Loading users...</div>;
  }

  return (
    <div className="admin-user-management">
      <div className="section-header">
        <h2>User Management</h2>
        <button
          onClick={() => setShowAddUser(true)}
          className="cta-button"
          style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px' }}
        >
          Add New User
        </button>
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {success && (
        <div className="success-message" style={{ 
          backgroundColor: '#d4edda', 
          color: '#155724', 
          padding: '0.75rem', 
          borderRadius: '4px', 
          marginBottom: '1rem',
          border: '1px solid #c3e6cb'
        }}>
          {success}
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <div className="modal" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3>Add New User</h3>
            <form onSubmit={handleAddUser}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="first_name">First Name</label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="First Name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="last_name">Last Name</label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Last Name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="name">Full Name (alternative)</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Full Name (if not using first/last name)"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="user@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  className="form-input"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="role">Role</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="member">Member</option>
                    <option value="affiliate">Affiliate</option>
                    <option value="reseller">Reseller</option>
                    <option value="pro_reseller">Pro Reseller</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="submit"
                  className="cta-button"
                  style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '4px', flex: 1 }}
                >
                  Create User
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="cta-button"
                  style={{ background: '#6b7280', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '4px', flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="users-table" style={{ marginTop: '2rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Role</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Created</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '0.75rem' }}>
                  {user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A'}
                </td>
                <td style={{ padding: '0.75rem' }}>{user.email}</td>
                <td style={{ padding: '0.75rem' }}>
                  <span style={{
                    backgroundColor: getRoleBadgeColor(user.role),
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase'
                  }}>
                    {user.role.replace('_', ' ')}
                  </span>
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <span style={{
                    backgroundColor: getStatusBadgeColor(user.status),
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    textTransform: 'capitalize'
                  }}>
                    {user.status}
                  </span>
                </td>
                <td style={{ padding: '0.75rem' }}>
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select
                      onChange={(e) => handleUpdateUserRole(user.id, e.target.value, user.status)}
                      value={user.role}
                      style={{ fontSize: '0.75rem', padding: '0.25rem' }}
                    >
                      <option value="member">Member</option>
                      <option value="affiliate">Affiliate</option>
                      <option value="reseller">Reseller</option>
                      <option value="pro_reseller">Pro Reseller</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      onClick={() => handleDeleteUser(user.id, user.email)}
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            No users found
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserManagement;