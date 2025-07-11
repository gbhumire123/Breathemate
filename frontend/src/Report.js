import React, { useState } from 'react';

const Report = () => {
  const [reports] = useState([
    {
      id: 1,
      date: '2024-07-12',
      breathingScore: 87,
      sessionsCompleted: 5,
      averageDepth: 'Good',
      recommendations: ['Continue daily breathing exercises', 'Maintain current routine']
    },
    {
      id: 2,
      date: '2024-07-11', 
      breathingScore: 82,
      sessionsCompleted: 4,
      averageDepth: 'Fair',
      recommendations: ['Focus on deeper breaths', 'Increase session duration']
    },
    {
      id: 3,
      date: '2024-07-10',
      breathingScore: 90,
      sessionsCompleted: 6,
      averageDepth: 'Excellent',
      recommendations: ['Great progress!', 'Keep up the excellent work']
    }
  ]);

  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [loading, setLoading] = useState(false);

  const generateReport = () => {
    setLoading(true);
    // Simulate report generation
    setTimeout(() => {
      setLoading(false);
      alert('New report generated successfully!');
    }, 2000);
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreStatus = (score) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-400/20">
        <h1 className="text-2xl font-bold text-white mb-2">Health Reports 📊</h1>
        <p className="text-gray-300">
          View your breathing health analysis and progress over time
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <label className="text-gray-400 text-sm">Time Period:</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-slate-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-400"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
          </select>
        </div>

        <button
          onClick={generateReport}
          disabled={loading}
          className="bg-cyan-400 text-gray-900 px-6 py-2 rounded-lg font-medium hover:bg-cyan-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Generating...' : 'Generate New Report'}
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h3 className="text-cyan-400 text-sm font-medium mb-2">Average Score</h3>
          <p className="text-3xl font-bold text-white">86</p>
          <p className="text-green-400 text-sm">+3% from last period</p>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h3 className="text-cyan-400 text-sm font-medium mb-2">Total Sessions</h3>
          <p className="text-3xl font-bold text-white">15</p>
          <p className="text-green-400 text-sm">+2 from last period</p>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h3 className="text-cyan-400 text-sm font-medium mb-2">Consistency</h3>
          <p className="text-3xl font-bold text-white">86%</p>
          <p className="text-yellow-400 text-sm">Daily goal achievement</p>
        </div>
      </div>

      {/* Reports List */}
      <div>
        <h2 className="text-xl font-bold text-white mb-6">Recent Reports</h2>
        
        {reports.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-12 border border-white/10">
            <div className="text-center">
              <div className="text-gray-400 text-6xl mb-4">📊</div>
              <p className="text-gray-400 text-lg">No reports available</p>
              <p className="text-gray-500 text-sm mt-2">
                Generate your first report to see your breathing health analysis
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {reports.map((report) => (
              <div key={report.id} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                  <div>
                    <h3 className="text-white font-medium text-lg">
                      Report for {new Date(report.date).toLocaleDateString()}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {report.sessionsCompleted} sessions completed
                    </p>
                  </div>
                  
                  <div className="mt-4 lg:mt-0 flex items-center space-x-4">
                    <div className="text-center">
                      <p className="text-gray-400 text-xs">Breathing Score</p>
                      <p className={`text-xl font-bold ${getScoreColor(report.breathingScore)}`}>
                        {report.breathingScore}
                      </p>
                      <p className={`text-xs ${getScoreColor(report.breathingScore)}`}>
                        {getScoreStatus(report.breathingScore)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Metrics */}
                  <div>
                    <h4 className="text-cyan-400 font-medium mb-3">Key Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Average Depth:</span>
                        <span className="text-white">{report.averageDepth}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Sessions:</span>
                        <span className="text-white">{report.sessionsCompleted}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Overall Score:</span>
                        <span className={getScoreColor(report.breathingScore)}>
                          {report.breathingScore}/100
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h4 className="text-cyan-400 font-medium mb-3">Recommendations</h4>
                    <ul className="space-y-1">
                      {report.recommendations.map((rec, index) => (
                        <li key={index} className="text-gray-300 text-sm flex items-start">
                          <span className="text-cyan-400 mr-2">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm">
                    View Details
                  </button>
                  <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm">
                    Download PDF
                  </button>
                  <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm">
                    Share Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl p-6 border border-blue-400/20">
        <h3 className="text-blue-400 font-semibold mb-4">Understanding Your Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="text-white font-medium mb-2">Breathing Score</h4>
            <p className="text-gray-400">
              A composite score based on breathing depth, rhythm, and consistency. 
              Higher scores indicate better respiratory health.
            </p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-2">Recommendations</h4>
            <p className="text-gray-400">
              Personalized suggestions based on your breathing patterns and health goals. 
              Follow these to improve your respiratory fitness.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;