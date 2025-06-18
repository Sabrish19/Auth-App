import { useState } from 'react';
import './App.css';
import axios from 'axios';

axios.defaults.withCredentials = true;

function App() {
  const [user, setUser] = useState({ username: '', password: '' });
  const [token, setToken] = useState('');
  const [profile, setProfile] = useState('');

  const handleInputChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value
    });
  };

  const register = async () => {
    try {
      const res = await axios.post("http://localhost:5000/register", user);
      alert(res.data.message);
    } catch (err) {
      console.error("Registration failed:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  const login = async () => {
    try {
      const res = await axios.post("http://localhost:5000/login", user);
      setToken(res.data.token);
      alert("Login successful");
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Login failed");
    }
  };

  const getProfile = async () => {
    try {
      const res = await axios.get("http://localhost:5000/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data.message);
    } catch (err) {
      console.error("Fetching profile failed:", err.response?.data || err.message);
      alert("Failed to fetch profile");
    }
  };

  return (
    <div className="container">
      <h1>🔐 Auth App</h1>
      <div className="form">
        <input
          name="username"
          placeholder="Username"
          onChange={handleInputChange}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleInputChange}
        />
        <div className="buttons">
          <button onClick={register}>Register</button>
          <button onClick={login}>Login</button>
          <button onClick={getProfile}>Get Profile</button>
        </div>
        {profile && <h2 className="profile">{profile}</h2>}
      </div>
    </div>
  );
}

export default App;
