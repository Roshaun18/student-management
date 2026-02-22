import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { query, collection, where, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import logger from '../utils/logger';
import '../styles/Dashboard.css';

function ManagerDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [approvedStudents, setApprovedStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchPendingApprovals();
    fetchApprovedStudents();
  }, [user]);

  const fetchPendingApprovals = async () => {
    try {
      const q = query(
        collection(db, 'submissions'),
        where('status', '==', 'pending'),
        orderBy('submittedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      logger.info('pending query size:', querySnapshot.size);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPendingApprovals(data);
    } catch (error) {
      logger.error('Error fetching pending approvals:', error);
      try {
        const q2 = query(
          collection(db, 'submissions'),
          where('status', '==', 'pending')
        );
        const snap2 = await getDocs(q2);
        logger.info('pending fallback size:', snap2.size);
        const data2 = snap2.docs.map(d => ({ id: d.id, ...d.data() }));
        setPendingApprovals(data2);
      } catch (fallbackErr) {
        logger.error('Fallback fetch for pending approvals failed:', fallbackErr);
      }
    }
  };

  const fetchApprovedStudents = async () => {
    try {
      const q = query(
        collection(db, 'submissions'),
        where('status', '==', 'approved'),
        orderBy('approvedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      logger.info('approved query size:', querySnapshot.size);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setApprovedStudents(data);
    } catch (error) {
      logger.error('Error fetching approved students:', error);
      try {
        const q2 = query(
          collection(db, 'submissions'),
          where('status', '==', 'approved')
        );
        const snap2 = await getDocs(q2);
        logger.info('approved fallback size:', snap2.size);
        const data2 = snap2.docs.map(d => ({ id: d.id, ...d.data() }));
        setApprovedStudents(data2);
      } catch (fallbackErr) {
        logger.error('Fallback fetch for approved students failed:', fallbackErr);
      }
    }
  };

  const handleApprove = async (id) => {
    setLoading(true);
    try {
      const submissionRef = doc(db, 'submissions', id);
      await updateDoc(submissionRef, {
        status: 'approved',
        approvedAt: new Date().toISOString(),
        approvedBy: user.email
      });

      fetchPendingApprovals();
      fetchApprovedStudents();
    } catch (error) {
      logger.error('Error approving submission:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id) => {
    setLoading(true);
    try {
      const submissionRef = doc(db, 'submissions', id);
      await updateDoc(submissionRef, {
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        rejectedBy: user.email
      });

      fetchPendingApprovals();
    } catch (error) {
      logger.error('Error rejecting submission:', error);
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

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Manager Dashboard</h1>
        <div className="header-info">
          <span>{user.email}</span>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="manager-content">
        <div className="approvals-section">
          <h2> Pending Approvals ({pendingApprovals.length})</h2>
          {pendingApprovals.length === 0 ? (
            <p className="no-data">No pending approvals</p>
          ) : (
            pendingApprovals.map(student => (
              <div key={student.id} className="approval-card">
                <div className="student-details">
                  <p><strong>Name:</strong> {student.name}</p>
                  <p><strong>Year:</strong> {student.year}</p>
                  <p><strong>Department:</strong> {student.department}</p>
                  <p><strong>Submitted:</strong> {new Date(student.submittedAt).toLocaleString()}</p>
                  <p><strong>Submitted By:</strong> {student.userEmail}</p>
                </div>
                <div className="action-buttons">
                  <button
                    className="btn-approve"
                    onClick={() => handleApprove(student.id)}
                    disabled={loading}
                  >
                     Approve
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => handleReject(student.id)}
                    disabled={loading}
                  >
                     Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="approved-section">
          <h2> Approved Students ({approvedStudents.length})</h2>
          {approvedStudents.length === 0 ? (
            <p className="no-data">No approved students yet</p>
          ) : (
            approvedStudents.map(student => (
              <div key={student.id} className="approved-card">
                <p><strong>Name:</strong> {student.name}</p>
                <p><strong>Year:</strong> {student.year}</p>
                <p><strong>Department:</strong> {student.department}</p>
                <p><strong>Approved:</strong> {new Date(student.approvedAt).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ManagerDashboard;
