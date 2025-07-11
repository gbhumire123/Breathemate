import React, { useState } from 'react';

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: true,
    language: 'English',
    autoAnalysis: true,
    recordingQuality: 'High',
    dataRetention: '6 months',
    shareData: false,
    breathingReminders: true,
    reminderInterval: '2 hours',
    soundEnabled: true,
    vibrationEnabled: true
  });

  const [activeSection, setActiveSection] = useState('general');

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      setSettings({
        notifications: true,
        darkMode: true,
        language: 'English',
        autoAnalysis: true,
        recordingQuality: 'High',
        dataRetention: '6 months',
        shareData: false,
        breathingReminders: true,
        reminderInterval: '2 hours',
        soundEnabled: true,
        vibrationEnabled: true
      });
    }
  };

  const exportData = () => {
    alert('Data export feature will be available in the next update!');
  };

  const deleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      alert('Account deletion requested. You will receive a confirmation email.');
    }
  };

  const ToggleSwitch = ({ enabled, onChange, label }) => (
    <div className="flex items-center justify-between py-3">
      <span className="text-gray-300">{label}</span>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-cyan-400' : 'bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const SelectInput = ({ value, onChange, options, label }) => (
    <div className="flex items-center justify-between py-3">
      <span className="text-gray-300">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-slate-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-400"
      >
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-500/10 to-slate-500/10 rounded-xl p-6 border border-gray-400/20">
        <h1 className="text-2xl font-bold text-white mb-2">Settings ⚙️</h1>
        <p className="text-gray-300">
          Customize your BreatheMate experience and manage your preferences
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-slate-800/50 backdrop-blur-sm rounded-xl p-1 border border-white/10">
        {[
          { id: 'general', label: 'General', icon: '⚙️' },
          { id: 'recording', label: 'Recording', icon: '🎙️' },
          { id: 'notifications', label: 'Notifications', icon: '🔔' },
          { id: 'privacy', label: 'Privacy', icon: '🔒' },
          { id: 'account', label: 'Account', icon: '👤' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors flex-1 justify-center ${
              activeSection === tab.id
                ? 'bg-cyan-400 text-gray-900'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="font-medium text-sm">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Settings Content */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        {activeSection === 'general' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">General Settings</h2>
            <div className="space-y-4">
              <ToggleSwitch
                enabled={settings.darkMode}
                onChange={(value) => updateSetting('darkMode', value)}
                label="Dark Mode"
              />
              
              <SelectInput
                value={settings.language}
                onChange={(value) => updateSetting('language', value)}
                options={['English', 'Spanish', 'French', 'German', 'Japanese']}
                label="Language"
              />

              <ToggleSwitch
                enabled={settings.autoAnalysis}
                onChange={(value) => updateSetting('autoAnalysis', value)}
                label="Auto-analyze recordings"
              />

              <SelectInput
                value={settings.dataRetention}
                onChange={(value) => updateSetting('dataRetention', value)}
                options={['1 month', '3 months', '6 months', '1 year', 'Forever']}
                label="Data retention period"
              />
            </div>
          </div>
        )}

        {activeSection === 'recording' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Recording Settings</h2>
            <div className="space-y-4">
              <SelectInput
                value={settings.recordingQuality}
                onChange={(value) => updateSetting('recordingQuality', value)}
                options={['Low', 'Medium', 'High', 'Ultra']}
                label="Recording Quality"
              />

              <ToggleSwitch
                enabled={settings.soundEnabled}
                onChange={(value) => updateSetting('soundEnabled', value)}
                label="Sound feedback during recording"
              />

              <div className="bg-slate-700/50 rounded-lg p-4 mt-6">
                <h3 className="text-cyan-400 font-medium mb-3">Recording Tips</h3>
                <ul className="text-gray-300 text-sm space-y-2">
                  <li>• Use a quiet environment for best results</li>
                  <li>• Hold the device 6-12 inches from your mouth</li>
                  <li>• Higher quality settings use more storage space</li>
                  <li>• Ultra quality is recommended for medical consultations</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'notifications' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Notification Settings</h2>
            <div className="space-y-4">
              <ToggleSwitch
                enabled={settings.notifications}
                onChange={(value) => updateSetting('notifications', value)}
                label="Enable notifications"
              />

              <ToggleSwitch
                enabled={settings.breathingReminders}
                onChange={(value) => updateSetting('breathingReminders', value)}
                label="Breathing exercise reminders"
              />

              <SelectInput
                value={settings.reminderInterval}
                onChange={(value) => updateSetting('reminderInterval', value)}
                options={['30 minutes', '1 hour', '2 hours', '4 hours', '8 hours']}
                label="Reminder interval"
              />

              <ToggleSwitch
                enabled={settings.vibrationEnabled}
                onChange={(value) => updateSetting('vibrationEnabled', value)}
                label="Vibration alerts"
              />

              <div className="bg-slate-700/50 rounded-lg p-4 mt-6">
                <h3 className="text-cyan-400 font-medium mb-3">Notification Types</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Breathing reminders</span>
                    <span className="text-green-400">Enabled</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Analysis complete</span>
                    <span className="text-green-400">Enabled</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Health insights</span>
                    <span className="text-green-400">Enabled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'privacy' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Privacy & Data</h2>
            <div className="space-y-4">
              <ToggleSwitch
                enabled={settings.shareData}
                onChange={(value) => updateSetting('shareData', value)}
                label="Share anonymized data for research"
              />

              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="text-cyan-400 font-medium mb-3">Data Usage</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Your breathing data is stored locally and encrypted. We never share personal 
                  health information without your explicit consent.
                </p>
                <div className="space-y-2">
                  <button
                    onClick={exportData}
                    className="w-full px-4 py-2 bg-cyan-400 text-gray-900 rounded-lg hover:bg-cyan-300 transition-colors font-medium"
                  >
                    Export My Data
                  </button>
                  <button
                    onClick={() => alert('Privacy policy opened in browser')}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                  >
                    View Privacy Policy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'account' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Account Management</h2>
            <div className="space-y-6">
              {/* User Info */}
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="text-cyan-400 font-medium mb-3">Account Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Email:</span>
                    <span className="text-white">user@example.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Member since:</span>
                    <span className="text-white">July 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total recordings:</span>
                    <span className="text-white">47</span>
                  </div>
                </div>
              </div>

              {/* Account Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => alert('Password change form opened')}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Change Password
                </button>
                
                <button
                  onClick={resetSettings}
                  className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-500 transition-colors"
                >
                  Reset All Settings
                </button>
                
                <button
                  onClick={deleteAccount}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* App Info */}
      <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl p-6 border border-indigo-400/20">
        <h3 className="text-indigo-400 font-semibold mb-4">About BreatheMate</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-300 mb-2">Version: 1.0.0</p>
            <p className="text-gray-300 mb-2">Build: 2024.07.12</p>
            <p className="text-gray-300">AI-Powered Lung Health Tracker</p>
          </div>
          <div>
            <p className="text-gray-300 mb-2">© 2024 BreatheMate</p>
            <p className="text-gray-300 mb-2">Made with ❤️ for better breathing</p>
            <button 
              onClick={() => alert('Support form opened')}
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;