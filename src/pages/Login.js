import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ setLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

const handleLogin = async () => {
  try {
    const res = await axios.post('http://localhost:5000/api/login', { username, password });
    if (res.data.success) {
      // store login time
      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('loginTime', new Date().getTime());
      setLoggedIn(true);
    }
  } catch (err) {
    alert('Login failed');
  }
};


  return (
    <div>

<div className="flex items-center justify-center min-h-screen">
  <div className="card w-full max-w-sm shadow-2xl">
    <form className="card-body">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Email</span>
        </label>
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className="input input-bordered" required />
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Password</span>
        </label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="input input-bordered" required />
      </div>
      <div className="form-control mt-6">
        <button onClick={handleLogin} className="btn w-full btn-primary">Login</button>
      </div>
    </form>
  </div>
</div>
    </div>
  );
};

export default Login;
