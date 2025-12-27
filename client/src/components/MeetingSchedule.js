import React, { useState, useEffect, useContext } from 'react';
import { meetingsAPI, studentsAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './MeetingSchedule.css';

const MeetingSchedule = () => {
  const { isAdmin } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState({
    studentId: '',
    meetingDate: new Date().toISOString().split('T')[0],
    notes: '',
    isImportant: false
  });

  useEffect(() => {
    fetchStudents();
    fetchMeetings();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await studentsAPI.getAll();
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchMeetings = async () => {
    try {
      const response = await meetingsAPI.getAll();
      setMeetings(response.data);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (meeting = null, studentId = null, date = null) => {
    if (meeting) {
      setEditingMeeting(meeting);
      setFormData({
        studentId: meeting.studentId,
        meetingDate: meeting.meetingDate.split('T')[0],
        notes: meeting.notes,
        isImportant: meeting.isImportant
      });
    } else {
      setEditingMeeting(null);
      setFormData({
        studentId: studentId || '',
        meetingDate: date || new Date().toISOString().split('T')[0],
        notes: '',
        isImportant: false
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMeeting(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMeeting) {
        await meetingsAPI.update(editingMeeting.id, formData);
      } else {
        await meetingsAPI.create(formData);
      }
      handleCloseModal();
      fetchMeetings();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving meeting');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this meeting note?')) return;
    
    try {
      await meetingsAPI.delete(id);
      fetchMeetings();
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting meeting');
    }
  };

  // Group meetings by date
  const meetingsByDate = meetings.reduce((acc, meeting) => {
    const date = meeting.meetingDate.split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(meeting);
    return acc;
  }, {});

  // Get unique dates and sort them
  const dates = Object.keys(meetingsByDate).sort((a, b) => new Date(a) - new Date(b));

  // Filter meetings by selected date
  const filteredMeetings = selectedDate 
    ? meetings.filter(m => m.meetingDate.startsWith(selectedDate))
    : meetings;

  if (loading) {
    return <div className="meeting-schedule-loading">Loading meeting schedule...</div>;
  }

  return (
    <div className="meeting-schedule">
      <div className="meeting-schedule-header">
        <h1>Meeting Schedule & Notes</h1>
        <div className="header-actions">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-filter"
          />
          <button onClick={() => handleOpenModal()} className="btn-primary">
            + Add Meeting Note
          </button>
        </div>
      </div>

      {filteredMeetings.length === 0 ? (
        <div className="empty-state">
          No meetings found. Add your first meeting note!
        </div>
      ) : (
        <div className="meetings-list">
          {dates.map(date => (
            <div key={date} className="date-group">
              <h2 className="date-header">
                {new Date(date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h2>
              <div className="meetings-for-date">
                {meetingsByDate[date].map(meeting => (
                  <div 
                    key={meeting.id} 
                    className={`meeting-card ${meeting.isImportant ? 'important' : ''}`}
                  >
                    <div className="meeting-card-header">
                      <div className="meeting-student">
                        <strong>{meeting.student?.firstName} {meeting.student?.lastName}</strong>
                        {meeting.isImportant && <span className="important-badge">Important</span>}
                      </div>
                      <div className="meeting-actions">
                        <button 
                          onClick={() => handleOpenModal(meeting)}
                          className="btn-small"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(meeting.id)}
                          className="btn-small btn-danger"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="meeting-notes">
                      {meeting.notes.split('\n').map((line, idx) => (
                        <p key={idx}>{line}</p>
                      ))}
                    </div>
                    <div className="meeting-meta">
                      <span className="meeting-author">
                        Added by {meeting.createdBy?.firstName} {meeting.createdBy?.lastName}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingMeeting ? 'Edit Meeting Note' : 'Add Meeting Note'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Student *</label>
                  <select
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    required
                  >
                    <option value="">Select Student</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.firstName} {student.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Meeting Date *</label>
                  <input
                    type="date"
                    value={formData.meetingDate}
                    onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Notes *</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="8"
                  required
                  placeholder="Enter meeting notes, assignments, action items, deadlines, etc. (like your spreadsheet format)"
                />
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isImportant}
                    onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
                  />
                  Mark as Important (like yellow highlight)
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={handleCloseModal} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingMeeting ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingSchedule;

