import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { addDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import logger from '../utils/logger';
import '../styles/Dashboard.css';

function UserDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    year: '',
    department: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserSubmissions();
  }, []);

  const fetchUserSubmissions = async () => {
    try {
      const q = query(
        collection(db, 'submissions'),
        where('userId', '==', user.uid),
        orderBy('submittedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSubmissions(data);
    } catch (error) {
      logger.error('Error fetching submissions:', error);
      try {
        const q = query(
          collection(db, 'submissions'),
          where('userId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSubmissions(data);
      } catch (fallbackError) {
        logger.error('Fallback fetch also failed:', fallbackError);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const docRef = await addDoc(collection(db, 'submissions'), {
        ...formData,
        userId: user.uid,
        userEmail: user.email,
        status: 'pending',
        submittedAt: new Date().toISOString()
      });

      logger.info('Document written with ID: ', docRef.id);

      setFormData({
        name: '',
        year: '',
        department: '',
      });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      
      setTimeout(() => {
        fetchUserSubmissions();
      }, 500);
    } catch (error) {
      logger.error('Error submitting form:', error);
      alert('Error submitting form: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onLogout();
      navigate('/login');
    } catch (error) {
      logger.error('Error logging out:', error);
    }
  };

  const courseOptions=["BE","Btech","BCom","BSc"];
  const departmentOptions=["CSE","IT","ECE","EEE","MECH","CIVIL"];
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>User Dashboard</h1>
        <div className="header-info">
          <span>{user.email}</span>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {submitted && <div className="success-message">✓ Submission successful! Awaiting manager approval.</div>}

      <div className="dashboard-content">
        <div className="form-section">
          <h2>Enter Student Details</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Year:</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Department:</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                disabled={loading}
            >
              <option value="">Select department</option>
              {departmentOptions.map(d=>(<option key={d} value={d}>{d}</option>))}
              </select>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit for Approval'}
            </button>
          </form>
        </div>

        <div className="submissions-section">
          <h2>My Submissions ({submissions.length})</h2>
          {submissions.length === 0 ? (
            <p className="no-data">No submissions yet</p>
          ) : (
            submissions.map(sub => (
              <div key={sub.id} className="submission-card">
                <p><strong>Name:</strong> {sub.name}</p>
                <p><strong>Year:</strong> {sub.year}</p>
                <p><strong>Department:</strong> {sub.department}</p>
                <p><strong>Status:</strong> <span className={`status ${sub.status}`}>{sub.status.toUpperCase()}</span></p>
                <p><strong>Submitted:</strong> {new Date(sub.submittedAt).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
