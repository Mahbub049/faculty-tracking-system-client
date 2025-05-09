import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import LateEntryForm from './pages/LateEntryForm';
import LateEntryReport from './pages/LateEntryReport';
import axios from 'axios';


function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  // Load login status from localStorage on first render
  useEffect(() => {
    const storedLogin = localStorage.getItem('loggedIn');
    if (storedLogin === 'true') {
      setLoggedIn(true);
    }
  }, []);
  
  useEffect(() => {
  const loginTime = localStorage.getItem('loginTime');
  const loggedIn = localStorage.getItem('loggedIn') === 'true';

  if (loggedIn && loginTime) {
    const now = new Date().getTime();
    const elapsedMinutes = (now - loginTime) / (1000 * 60); // in minutes

    if (elapsedMinutes < 30) {
      setLoggedIn(true); // session is still valid
    } else {
      // expired
      localStorage.removeItem('loggedIn');
      localStorage.removeItem('loginTime');
      setLoggedIn(false);
    }
  }
}, []);


  // Save login status to localStorage
  const handleLogin = () => {
    localStorage.setItem('loggedIn', 'true');
    setLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedIn');
    setLoggedIn(false);
  };
  
  const [entries, setEntries] = useState([]);

const fetchEntries = () => {
  axios.get('http://localhost:5000/api/late-entry')
    .then(res => setEntries(res.data))
    .catch(err => console.error(err));
};

useEffect(() => {
  fetchEntries();
}, []);

  return (
    <div>
      {loggedIn ? (
        <div className='container mx-auto'>


<div className="navbar bg-base-100 mb-4">
  <div className="flex-1">
    <a className="btn btn-ghost text-xl">Faculty Late Tracking System</a>
  </div>
  <div className="flex-none">
    <ul className="menu menu-horizontal px-1">
            <li><button onClick={handleLogout}>Logout</button></li>
      {/* <li>
        <details>
          <summary>Parent</summary>
          <ul className="bg-base-100 rounded-t-none p-2">
            <li><a>Link 1</a></li>
            <li><a>Link 2</a></li>
          </ul>
        </details>
      </li> */}
    </ul>
  </div>
</div>
    <LateEntryForm refreshEntries={fetchEntries} />
    <LateEntryReport entries={entries} />
        </div>
      ) : (
        <Login setLoggedIn={handleLogin} />
      )}
    </div>
  );
}

export default App;
