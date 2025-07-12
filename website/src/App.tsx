import React, { useState } from 'react';
import './App.css';

// Components (we'll create these to match your Expo app)
const Dashboard = () => (
  <div className="page">
    <h1 className="page-title">📊 Dashboard</h1>
    <div className="card">
      <h3>Health Overview</h3>
      <p>Welcome to BreatheMate Web! Your breathing analysis platform.</p>
    </div>
  </div>
);

const Record = () => (
  <div className="page">
    <h1 className="page-title">🎤 Record Breath</h1>
    <div className="card">
      <h3>Audio Recording</h3>
      <p>Record your breathing for AI analysis.</p>
      <button className="record-button">Start Recording</button>
    </div>
  </div>
);

const Journal = () => (
  <div className="page">
    <h1 className="page-title">📝 Journal</h1>
    <div className="card">
      <h3>Health Journal</h3>
      <p>Track your daily breathing patterns and health insights.</p>
    </div>
  </div>
);

const Settings = () => (
  <div className="page">
    <h1 className="page-title">⚙️ Settings</h1>
    <div className="card">
      <h3>App Preferences</h3>
      <p>Customize your BreatheMate experience.</p>
    </div>
  </div>
);

const Login = () => (
  <div className="login-page">
    <div className="login-card">
      <h1>🫁 BreatheMate</h1>
      <p>AI-powered breathing analysis</p>
      <div className="form-group">
        <input type="email" placeholder="Email" className="input-field" />
      </div>
      <div className="form-group">
        <input type="password" placeholder="Password" className="input-field" />
      </div>
      <button className="login-button">Sign In</button>
      <p className="demo-text">Demo: demo@breathemate.com / demo123</p>
    </div>
  </div>
);

function App() {
  const [currentPage, setCurrentPage] = useState<string>('login');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const renderPage = () => {
    if (!isLoggedIn) {
      return <Login />;
    }

    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'record': return <Record />;
      case 'journal': return <Journal />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
  };

  return (
    <div className="app">
      {isLoggedIn && (
        <nav className="navbar">
          <div className="nav-brand">
            <h2>🫁 BreatheMate</h2>
          </div>
          <div className="nav-links">
            <button 
              onClick={() => setCurrentPage('dashboard')}
              className={currentPage === 'dashboard' ? 'nav-button active' : 'nav-button'}
            >
              📊 Dashboard
            </button>
            <button 
              onClick={() => setCurrentPage('record')}
              className={currentPage === 'record' ? 'nav-button active' : 'nav-button'}
            >
              🎤 Record
            </button>
            <button 
              onClick={() => setCurrentPage('journal')}
              className={currentPage === 'journal' ? 'nav-button active' : 'nav-button'}
            >
              📝 Journal
            </button>
            <button 
              onClick={() => setCurrentPage('settings')}
              className={currentPage === 'settings' ? 'nav-button active' : 'nav-button'}
            >
              ⚙️ Settings
            </button>
          </div>
          <button 
            onClick={() => setIsLoggedIn(false)}
            className="logout-button"
          >
            🚪 Logout
          </button>
        </nav>
      )}
      
      <main className="main-content">
        {renderPage()}
      </main>
      
      {/* Demo login button for testing */}
      {!isLoggedIn && (
        <button 
          onClick={handleLogin}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: '#00ffff',
            color: '#000',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '25px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Demo Login
        </button>
      )}
    </div>
  );
}

export default App;
