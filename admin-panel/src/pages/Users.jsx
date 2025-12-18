import { useState, useEffect } from 'react';
import api from '../services/api';
import './Users.css';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'USER',
    status: 'ACTIVE',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await api.getUsers();
      setUsers(response.data || []);
    } catch (err) {
      console.error('Error loading users:', err);
      // Users API might not be implemented yet
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email || '',
        password: '', // Don't prefill password
        fullName: user.fullName || '',
        role: user.role || 'USER',
        status: user.status || 'ACTIVE',
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        password: '',
        fullName: '',
        role: 'USER',
        status: 'ACTIVE',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = {
        email: formData.email,
        fullName: formData.fullName,
        role: formData.role,
        status: formData.status,
      };

      // Only include password if creating new user or changing it
      if (!editingUser || formData.password) {
        if (!formData.password) {
          alert('Password is required for new users');
          return;
        }
        userData.password = formData.password;
      }

      if (editingUser) {
        await api.updateUser(editingUser.id, userData);
      } else {
        await api.createUser(userData);
      }

      handleCloseModal();
      loadUsers();
    } catch (err) {
      alert('Error saving user: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await api.deleteUser(id);
      loadUsers();
    } catch (err) {
      alert('Error deleting user: ' + err.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Users</h2>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          + Add User
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Full Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                    No users found. Users API may not be implemented yet.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.email}</td>
                    <td>{user.fullName || 'N/A'}</td>
                    <td>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          background:
                            user.role === 'ADMIN'
                              ? '#dbeafe'
                              : user.role === 'EDITOR'
                              ? '#e0e7ff'
                              : '#f3f4f6',
                          color:
                            user.role === 'ADMIN'
                              ? '#1e40af'
                              : user.role === 'EDITOR'
                              ? '#3730a3'
                              : '#374151',
                        }}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          background: user.status === 'ACTIVE' ? '#d1fae5' : '#fee2e2',
                          color: user.status === 'ACTIVE' ? '#065f46' : '#991b1b',
                        }}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleOpenModal(user)}
                        style={{ marginRight: '5px', padding: '5px 10px', fontSize: '12px' }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(user.id)}
                        style={{ padding: '5px 10px', fontSize: '12px' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingUser ? 'Edit User' : 'Add User'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={!!editingUser}
                />
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
              {(!editingUser || formData.password) && (
                <div className="form-group">
                  <label>Password {!editingUser && '*'}</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingUser}
                    placeholder={editingUser ? 'Leave empty to keep current password' : ''}
                  />
                </div>
              )}
              <div className="form-row">
                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="USER">USER</option>
                    <option value="EDITOR">EDITOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="DISABLED">DISABLED</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingUser ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;

