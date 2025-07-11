import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import Journal from './Journal';
import Report from './Report';
import RecordBreath from './RecordBreath';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <header className="bg-blue-600 text-white p-4 shadow-lg">
          <nav className="flex justify-between items-center max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-cyan-400">BreatheMate</h1>
            <div className="space-x-6">
              <Link to="/dashboard" className="hover:text-cyan-400 transition-colors">Dashboard</Link>
              <Link to="/record-breath" className="hover:text-cyan-400 transition-colors">Record Breath</Link>
              <Link to="/journal" className="hover:text-cyan-400 transition-colors">Journal</Link>
              <Link to="/report" className="hover:text-cyan-400 transition-colors">Report</Link>
            </div>
          </nav>
        </header>
        
        <main>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/record-breath" element={<RecordBreath />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/report" element={<Report />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
