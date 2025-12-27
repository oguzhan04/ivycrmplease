import React, { useState, useEffect, useContext } from 'react';
import { studentsAPI, usersAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './CRM.css';

const CRM = () => {
  const { isAdmin } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    parentName: '',
    contactInfo: '',
    email: '',
    phone: '',
    leadStatus: 'prospect',
    serviceType: '',
    price: '',
    feePerYear: '',
    school: '',
    notes: '',
    counsellorIds: []
  });

  useEffect(() => {
    fetchStudents();
    if (isAdmin) {
      fetchCounsellors();
    }
  }, [isAdmin]);

  const fetchStudents = async () => {
    try {
      const response = await studentsAPI.getAll();
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCounsellors = async () => {
    try {
      const response = await usersAPI.getAll();
      setCounsellors(response.data.filter(u => u.role === 'counsellor'));
    } catch (error) {
      console.error('Error fetching counsellors:', error);
    }
  };

  const handleOpenModal = (student = null) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        firstName: student.firstName,
        lastName: student.lastName,
        parentName: student.parentName || '',
        contactInfo: student.contactInfo || '',
        email: student.email || '',
        phone: student.phone || '',
        leadStatus: student.leadStatus || 'prospect',
        serviceType: student.serviceType || '',
        price: student.price || '',
        feePerYear: student.feePerYear || '',
        school: student.school || '',
        notes: student.notes || '',
        counsellorIds: student.counsellors?.map(c => c.id) || []
      });
    } else {
      setEditingStudent(null);
      setFormData({
        firstName: '',
        lastName: '',
        parentName: '',
        contactInfo: '',
        email: '',
        phone: '',
        leadStatus: 'prospect',
        serviceType: '',
        price: '',
        feePerYear: '',
        school: '',
        notes: '',
        counsellorIds: []
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStudent(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await studentsAPI.update(editingStudent.id, formData);
        if (isAdmin && formData.counsellorIds.length > 0) {
          await studentsAPI.assignCounsellors(editingStudent.id, formData.counsellorIds);
        }
      } else {
        await studentsAPI.create(formData);
      }
      handleCloseModal();
      fetchStudents();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving student');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    
    try {
      await studentsAPI.delete(id);
      fetchStudents();
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting student');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      prospect: '#95a5a6',
      success: '#27ae60', // Başarılı - Green
      failed: '#e74c3c', // Başarısız - Red
      tentative: '#f39c12', // Tentative/Seneye - Yellow
      active: '#3498db',
      applied: '#f39c12',
      accepted: '#27ae60',
      enrolled: '#2ecc71',
      inactive: '#e74c3c'
    };
    return colors[status] || '#95a5a6';
  };

  if (loading) {
    return <div className="crm-loading">Loading students...</div>;
  }

  return (
    <div className="crm">
      <div className="crm-header">
        <h1>CRM - Student Management</h1>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          + Add Student
        </button>
      </div>

      <div className="students-table-container">
        <table className="students-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Parent Name</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Service</th>
              <th>Price</th>
              <th>School</th>
              <th>Counsellor</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 9 : 8} className="empty-state">
                  No students found. Add your first lead!
                </td>
              </tr>
            ) : (
              students.map(student => (
                <tr key={student.id}>
                  <td>{student.firstName} {student.lastName}</td>
                  <td>{student.parentName || '-'}</td>
                  <td>{student.contactInfo || student.email || student.phone || '-'}</td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(student.leadStatus) }}
                    >
                      {student.leadStatus}
                    </span>
                  </td>
                  <td>{student.serviceType || '-'}</td>
                  <td>{student.price || '-'}</td>
                  <td>{student.school || '-'}</td>
                  <td>
                    {student.counsellors?.map(c => c.firstName).join(', ') || '-'}
                  </td>
                  {isAdmin && (
                    <td>
                      <button 
                        onClick={() => handleOpenModal(student)}
                        className="btn-small"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(student.id)}
                        className="btn-small btn-danger"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingStudent ? 'Edit Student' : 'Add New Student'}</h2>
            <form onSubmit={handleSubmit}>
              <h3>Student Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>School</label>
                <input
                  type="text"
                  value={formData.school}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                  placeholder="e.g., Koç, UAA, Hasal"
                />
              </div>

              <h3>Parent/Lead Information</h3>
              <div className="form-group">
                <label>Parent Name (Veli İsim)</label>
                <input
                  type="text"
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  placeholder="e.g., Seçkin Bey, Aslı Hanım"
                />
              </div>
              <div className="form-group">
                <label>Contact Info (İrtibat No/Email)</label>
                <textarea
                  value={formData.contactInfo}
                  onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                  rows="2"
                  placeholder="Contact number, email, or notes (e.g., 'Annesi', 'Babası Ayhan Mucur')"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <h3>Lead Status & Service</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Lead Status</label>
                  <select
                    value={formData.leadStatus}
                    onChange={(e) => setFormData({ ...formData, leadStatus: e.target.value })}
                  >
                    <option value="prospect">Prospect</option>
                    <option value="success">Başarılı (Success)</option>
                    <option value="failed">Başarısız (Failed)</option>
                    <option value="tentative">Tentative/Seneye</option>
                    <option value="active">Active</option>
                    <option value="applied">Applied</option>
                    <option value="accepted">Accepted</option>
                    <option value="enrolled">Enrolled</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Service Type (HİZMET)</label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  >
                    <option value="">Select Service</option>
                    <option value="US">US</option>
                    <option value="UK">UK</option>
                    <option value="US+UK">US + UK</option>
                    <option value="UK+EU">UK + EU</option>
                    <option value="US+UK+EU">US + UK + EU</option>
                    <option value="AP">AP</option>
                    <option value="Consultancy">Consultancy</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price (FİYAT)</label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g., 7500 USD, 6000+KDV"
                  />
                </div>
                <div className="form-group">
                  <label>Fee/Year (F/Y)</label>
                  <input
                    type="text"
                    value={formData.feePerYear}
                    onChange={(e) => setFormData({ ...formData, feePerYear: e.target.value })}
                    placeholder="e.g., 1875 USD, 2500 GBP"
                  />
                </div>
              </div>
              {isAdmin && (
                <div className="form-group">
                  <label>Assign Counsellors</label>
                  <div className="checkbox-group">
                    {counsellors.map(counsellor => (
                      <label key={counsellor.id} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.counsellorIds.includes(counsellor.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                counsellorIds: [...formData.counsellorIds, counsellor.id]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                counsellorIds: formData.counsellorIds.filter(id => id !== counsellor.id)
                              });
                            }
                          }}
                        />
                        {counsellor.firstName} {counsellor.lastName}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="4"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={handleCloseModal} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingStudent ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRM;

