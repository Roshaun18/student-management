import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import './App.css';

function App() {
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");
  const [students, setStudents] = useState([]);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");

  const studentCollection = collection(db, "students");

  useEffect(() => {
    const unsubscribe = onSnapshot(studentCollection, (snapshot) => {
      setStudents(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return unsubscribe;
  }, []);

  const showMsg = (txt) => {
    setMessage(txt);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await updateDoc(doc(db, "students", editId), { name, course, year });
      showMsg("Successfully Updated!");
      setEditId(null);
    } else {
      await addDoc(studentCollection, { name, course, year });
      showMsg("Successfully Added!");
    }
    setName(""); setCourse(""); setYear("");
  };

  const handleEdit = (s) => {
    setEditId(s.id);
    setName(s.name);
    setCourse(s.course);
    setYear(s.year);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this?")) {
      await deleteDoc(doc(db, "students", id));
      showMsg("Successfully Deleted!");
    }
  };

  return (
    <div className="container">
      <h1>Student Manager</h1>
      {message && <div className="alert">{message}</div>}
      <form onSubmit={handleSubmit} className="input-group">
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Course" value={course} onChange={(e) => setCourse(e.target.value)} />
        <input placeholder="Year" value={year} onChange={(e) => setYear(e.target.value)} />
        <button type="submit">{editId ? "Update" : "Submit"}</button>
      </form>
      <table>
        <thead>
          <tr><th>ID</th><th>Name</th><th>Course</th><th>Year</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {students.map(s => (
            <tr key={s.id}>
              <td style={{fontSize: '10px'}}>{s.id}</td>
              <td>{s.name}</td><td>{s.course}</td><td>{s.year}</td>
              <td>
  <button className="edit-btn" onClick={() => handleEdit(s)}>Edit</button>
  <button className="delete-btn" onClick={() => handleDelete(s.id)}>Delete</button>
</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;