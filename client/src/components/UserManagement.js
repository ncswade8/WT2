import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, UserPlus, Edit, Trash2, Eye, EyeOff, Users as UsersIcon, Search, Calendar, Mail } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../config/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const endpoint = currentUser?.isAdmin ? '/api/admin/users' : '/api/users';
      const response = await axios.get(getApiUrl(endpoint));
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (userData) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post(getApiUrl('/api/admin/users'), userData);
      if (response.data.success) {
        toast.success('User created successfully');
        setShowCreateForm(false);
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async (userId, userData) => {
    setIsSubmitting(true);
    try {
      const response = await axios.put(getApiUrl(`/api/admin/users/${userId}`), userData);
      if (response.data.success) {
        toast.success('User updated successfully');
        setEditingUser(null);
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === currentUser?.id) {
      toast.error('You cannot delete your own account');
      return;
    }
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const response = await axios.delete(getApiUrl(`/api/admin/users/${userId}`));
        if (response.data.success) {
          toast.success('User deleted successfully');
          fetchUsers();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const toggleUserStatus = async (userId, isActive) => {
    try {
      const response = await axios.patch(getApiUrl(`/api/admin/users/${userId}/status`), {
        isActive: !isActive
      });
      if (response.data.success) {
        toast.success(`User ${isActive ? 'deactivated' : 'activated'} successfully`);
        fetchUsers();
      }
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const filteredUsers = users.filter(user => 
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return <div className="loading">Loading user management...</div>;
  }

  return (
    <div>
      <h1 className="page-title">
        {currentUser?.isAdmin ? 'Admin Panel' : 'User Management'}
      </h1>
      <p className="page-subtitle">
        {currentUser?.isAdmin
          ? 'Manage users, roles, and system access'
          : 'View and manage all registered users on the platform'}
      </p>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ marginBottom: '0.5rem', color: '#333' }}>
              {currentUser?.isAdmin ? (
                <Shield size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              ) : (
                <UsersIcon size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              )}
              {currentUser?.isAdmin ? 'User Management' : `All Users (${users.length})`}
            </h2>
            <p style={{ color: '#666', margin: 0 }}>
              {currentUser?.isAdmin
                ? 'Create, edit, and manage user accounts and permissions'
                : 'Manage user accounts and view registration details'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1em', alignItems: 'center' }}>
            {currentUser?.isAdmin && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <UserPlus size={16} />
                Add User
              </button>
            )}
            <div style={{ position: 'relative' }}>
              <Search size={20} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#666'
              }} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '12px 16px 12px 40px',
                  border: '2px solid #e1e5e9',
                  borderRadius: '8px',
                  fontSize: '16px',
                  width: '300px',
                  outline: 'none'
                }}
              />
            </div>
          </div>
        </div>

        {/* Admin Create User Form */}
        {currentUser?.isAdmin && showCreateForm && (
          <div style={{
            marginBottom: '2rem',
            border: '2px solid #99cc00',
            padding: '1rem',
            borderRadius: '8px',
            background: '#f8f9fa'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#333' }}>
              <UserPlus size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Create New User
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const userData = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                password: formData.get('password'),
                isAdmin: formData.get('isAdmin') === 'admin',
                isActive: formData.get('isActive') === 'active'
              };
              handleCreateUser(userData);
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input type="text" name="firstName" className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input type="text" name="lastName" className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" name="email" className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input type="password" name="password" className="form-input" required minLength={6} />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select name="isAdmin" className="form-input">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select name="isActive" className="form-input">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create User'}
                </button>
                <button type="button" onClick={() => setShowCreateForm(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Users Table */}
        {filteredUsers.length === 0 ? (
          <div className="empty-state">
            <h3>No Users Found</h3>
            <p>
              {searchTerm
                ? `No users match "${searchTerm}". Try a different search term.`
                : 'No users have registered yet. Users will appear here once they sign up.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Registration Date</th>
                  <th>Last Login</th>
                  <th>Status</th>
                  {currentUser?.isAdmin && <th>Role</th>}
                  {currentUser?.isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}>
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', color: '#333' }}>
                            {user.firstName} {user.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Mail size={16} style={{ color: '#666' }} />
                        {user.email}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={16} style={{ color: '#666' }} />
                        {formatDate(user.registrationDate)}
                      </div>
                    </td>
                    <td>
                      {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: user.isActive ? '#d4edda' : '#f8d7da',
                        color: user.isActive ? '#155724' : '#721c24'
                      }}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {currentUser?.isAdmin && (
                      <td>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          background: user.isAdmin ? '#fff3cd' : '#e2e3e5',
                          color: user.isAdmin ? '#856404' : '#383d41'
                        }}>
                          {user.isAdmin ? 'Admin' : 'User'}
                        </span>
                      </td>
                    )}
                    {currentUser?.isAdmin && (
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => toggleUserStatus(user._id, user.isActive)}
                            className="btn btn-sm"
                            style={{
                              background: user.isActive ? '#dc3545' : '#28a745',
                              color: 'white',
                              border: 'none',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                            title={user.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {user.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          <button
                            onClick={() => setEditingUser(user)}
                            className="btn btn-sm btn-secondary"
                            style={{
                              background: '#6c757d',
                              color: 'white',
                              border: 'none',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="btn btn-sm"
                            style={{
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                            title="Delete"
                            disabled={user._id === currentUser?.id}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Registration Summary */}
      {users.length > 0 && (
        <div className="card">
          <h2 style={{ marginBottom: '2rem', color: '#333' }}>
            <Calendar size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Registration Summary
          </h2>
          <div className="analytics-grid">
            <div className="analytics-card">
              <div className="analytics-number">{users.length}</div>
              <div className="analytics-label">Total Users</div>
            </div>
            <div className="analytics-card">
              <div className="analytics-number">
                {users.filter(user => user.isActive).length}
              </div>
              <div className="analytics-label">Active Users</div>
            </div>
            <div className="analytics-card">
              <div className="analytics-number">
                {users.filter(user => {
                  const thirtyDaysAgo = new Date();
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                  return new Date(user.registrationDate) >= thirtyDaysAgo;
                }).length}
              </div>
              <div className="analytics-label">Recent Registrations</div>
            </div>
            <div className="analytics-card">
              <div className="analytics-number">
                {users.filter(user => {
                  const today = new Date();
                  const userDate = new Date(user.registrationDate);
                  return userDate.toDateString() === today.toDateString();
                }).length}
              </div>
              <div className="analytics-label">Today's Registrations</div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Edit User Modal */}
      {currentUser?.isAdmin && editingUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#333' }}>
              <Edit size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Edit User: {editingUser.firstName} {editingUser.lastName}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const userData = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                isAdmin: formData.get('isAdmin') === 'admin',
                isActive: formData.get('isActive') === 'active'
              };
              handleUpdateUser(editingUser._id, userData);
            }}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input type="text" name="firstName" className="form-input" defaultValue={editingUser.firstName} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input type="text" name="lastName" className="form-input" defaultValue={editingUser.lastName} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" name="email" className="form-input" defaultValue={editingUser.email} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select name="isAdmin" className="form-input" defaultValue={editingUser.isAdmin ? 'admin' : 'user'}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select name="isActive" className="form-input" defaultValue={editingUser.isActive ? 'active' : 'inactive'}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update User'}
                </button>
                <button type="button" onClick={() => setEditingUser(null)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 