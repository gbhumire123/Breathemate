import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import Journal from './Journal';
import Report from './Report';

function App() {
  return (
    <Router>
      <header className="bg-blue-500 text-white p-4">
        <nav className="flex justify-between">
          <h1 className="text-xl font-bold">BreatheMate</h1>
          <div>
            <Link to="/dashboard" className="mr-4 hover:underline">Dashboard</Link>
            <Link to="/journal" className="mr-4 hover:underline">Journal</Link>
            <Link to="/report" className="hover:underline">Report</Link>
          </div>
        </nav>
      </header>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/report" element={<Report />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
