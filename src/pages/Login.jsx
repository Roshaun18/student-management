import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {createUserWithEmailAndPassword, signInWithEmailAndPassword} from 'firebase/auth';
import {setDoc,doc,getDoc} from 'firebase/firestore';
import{auth,db} from '../firebaseConfig';
import '../styles/Login.css';

function Login({onLogin}){
    const [isSignUp, setIsSignUp]=useState(false);
    const [role,setRole]=useState('user');
    const [email,setEmail]=useState('');
    const [password,setPassword]=useState('');
    const [error,setError]=useState('');
    const [loading,setLoading]=useState(false);
    const navigate=useNavigate();

    const handleSubmit=async(e)=>{
        e.preventDefault();
        setError('');
        setLoading(true);
        if(!email || !password){
            setError('Please fill all fields');
            setLoading(false);
            return;
        }

        try{
            if(isSignUp){
                const userCredential= await createUserWithEmailAndPassword(auth,email,password);
                const user=userCredential.user;

                await setDoc(doc(db, 'users', user.uid),{
                    uid:user.uid,
                    email:email,
                    role:role,
                    createdAt:new Date().toISOString()
                });

                const userData={
                    uid:user.uid,
                    email:email,
                    role:role
                };

                onLogin(userData);
                navigate(role==='user'? '/user-dashboard' : '/manager-dashboard');
            }
            else{
                const userCredential= await signInWithEmailAndPassword(auth,email,password);
                const user=userCredential.user;

                const userDoc=await getDoc(doc(db,'users', user.uid));
                if(userDoc.exists()){
                    const userData={
                        uid:user.uid,
                        email:userDoc.data().email,
                        role:userDoc.data().role
                    };

                    onLogin(userData);
                    navigate(userData.role==='user' ? '/user-dashboard' : '/manager-dashboard');
                }else{
                    setError('User data not found');
                }
            }
        }catch(err){
            setError(err.message);
        }finally{
            setLoading(false);
        }

        
    };

    return(
        <div className="login-container">
            <div className="login-box">
                <h1>{isSignUp ? 'Sign Up' : 'Login'}</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email:</label>
                        <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="enter your email" disabled={loading}/>
                    </div>
                    
                    <div className="form-group">
                        <label>Password:</label>
                        <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Enter your password" disabled={loading}/>
                    </div>
                    
                    {isSignUp && (
                        <div className="form-group">
                            <label>Role:</label>
                            <select value={role} onChange={(e)=>setRole(e.target.value)} disabled={loading}
                            >
                                <option value="user">User</option>
                                <option value="manager">Manager</option>
                            </select>
                        </div>
                    )}

                    {error && <p className="error">{error}</p>}
                    <button type="submit" className="btn-login" disabled={loading}>
                        {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Login')}
                    </button>
                </form>

                <p>
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}{''}
                    <button type="button" onClick={()=>{
                        setIsSignUp(!isSignUp);
                        setError('');
                    }}
                    className="toggle-btn"
                    disabled={loading}
                    >
                        {isSignUp ? 'Login' : 'Sign Up'}
                    </button>
                </p>
            </div>
        </div>
    );
}

export default Login;