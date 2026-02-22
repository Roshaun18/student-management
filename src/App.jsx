import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';
import './App.css';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import PrivateRoute from './components/PrivateRoute';

function App(){
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    const storedUser=localStorage.getItem('user');
    if(storedUser){
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  },[]);

  const handleLogin=(userData)=>{
    setUser(userData);
    localStorage.setItem('user',JSON.stringify(userData));
  };

  const handleLogout=()=>{
    setUser(null);
    localStorage.removeItem('user');
  };

  if(loading) return <div>Loading...</div>;

  return(
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin}/>}/>

        <Route path="/user-dashboard" element={<PrivateRoute user={user} role="user">
          <UserDashboard user={user} onLogout={handleLogout}/>
        </PrivateRoute>}
        />

        <Route path="/manager-dashboard" element={<PrivateRoute user={user} role="manager">
          <ManagerDashboard user={user} onLogout={handleLogout}/>
        </PrivateRoute>}
        />

        <Route path="*" element={<Login onLogin={handleLogin}/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

