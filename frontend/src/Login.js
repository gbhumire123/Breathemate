import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/login', { email, password });
      localStorage.setItem('token', response.data.token);
      alert('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      setError('Login failed! Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-gray-900 to-gray-800"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-extrabold text-neon-green mb-6">Login</h1>
      {error && <motion.p className="text-red-500 mb-4" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>{error}</motion.p>}
      <motion.form onSubmit={handleLogin} className="w-3/4" initial={{ y: -20 }} animate={{ y: 0 }} transition={{ duration: 0.3 }}>
        <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-neon-green"
            required
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-neon-green"
            required
          />
        </div>
        <motion.button
          type="submit"
          className="bg-neon-green text-gray-900 font-bold py-2 px-4 rounded shadow-lg hover:bg-neon-green-light w-full"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </motion.button>
      </motion.form>
      <motion.button
        className="mt-4 bg-gray-700 text-white font-bold py-2 px-4 rounded shadow-lg hover:bg-gray-600"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        Sign in with Google
      </motion.button>
    </motion.div>
  );
};

export default Login;