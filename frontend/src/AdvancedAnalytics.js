import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Heart,
  Zap,
  Target,
  Calendar,
  Clock,
  Award,
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  Pie,
  LineChart,
  Filter,
  Download,
  Share2,
  Sparkles
} from 'lucide-react';

const AdvancedAnalytics = () => {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('overall');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulated advanced analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAnalyticsData({
        healthScore: 84,
        trends: {
          respiratoryRate: { current: 16, change: -2, trend: 'improving' },
          oxygenEfficiency: { current: 92, change: 5, trend: 'improving' },
          stressLevel: { current: 28, change: -12, trend: 'improving' },
          sleepQuality: { current: 78, change: 8, trend: 'improving' }
        },
        predictions: {
          nextWeekScore: 87,
          riskFactors: ['mild_anxiety', 'irregular_patterns'],
          recommendations: [
            'Practice deep breathing exercises for 10 minutes daily',
            'Maintain consistent sleep schedule',
            'Consider meditation to reduce stress levels'
          ]
        },
        patterns: {
          bestTimeOfDay: '08:00 AM',
          consistencyScore: 76,
          improvementRate: 15,
          weeklyProgress: [72, 75, 78, 81, 84, 86, 84]
        },
        insights: [
          {
            type: 'achievement',
            title: 'Breathing Consistency Improved',
            description: 'Your breathing patterns have become 23% more consistent over the past week.',
            impact: 'high',
            date: '2025-07-11'
          },
          {
            type: 'warning',
            title: 'Irregular Evening Patterns',
            description: 'Consider relaxation techniques before bedtime to improve evening breathing quality.',
            impact: 'medium',
            date: '2025-07-10'
          },
          {
            type: 'tip',
            title: 'Optimal Recording Time',
            description: 'Your best breathing recordings happen around 8 AM. Try to maintain this timing.',
            impact: 'low',
            date: '2025-07-09'
          }
        ]
      });
      setLoading(false);
    };

    fetchAnalytics();
  }, [selectedTimeFrame]);

  const StatCard = ({ icon: Icon, title, value, change, trend, color = 'cyan' }) => (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-r from-${color}-400 to-${color}-600 rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex items-center space-x-1">
          {trend === 'improving' ? (
            <TrendingUp className="w-4 h-4 text-green-400" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-400" />
          )}
          <span className={`text-sm font-medium ${trend === 'improving' ? 'text-green-400' : 'text-red-400'}`}>
            {change > 0 ? '+' : ''}{change}%
          </span>
        </div>
      </div>
      <h3 className="text-white font-semibold text-lg">{title}</h3>
      <p className="text-2xl font-bold text-white mt-2">{value}</p>
    </motion.div>
  );

  const InsightCard = ({ insight }) => {
    const getIcon = () => {
      switch (insight.type) {
        case 'achievement': return CheckCircle;
        case 'warning': return AlertTriangle;
        case 'tip': return Sparkles;
        default: return Activity;
      }
    };

    const getColor = () => {
      switch (insight.type) {
        case 'achievement': return 'text-green-400 bg-green-400/20';
        case 'warning': return 'text-yellow-400 bg-yellow-400/20';
        case 'tip': return 'text-blue-400 bg-blue-400/20';
        default: return 'text-gray-400 bg-gray-400/20';
      }
    };

    const Icon = getIcon();

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300"
      >
        <div className="flex items-start space-x-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getColor()}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h4 className="text-white font-medium text-sm">{insight.title}</h4>
            <p className="text-gray-300 text-xs mt-1">{insight.description}</p>
            <span className="text-gray-400 text-xs">{insight.date}</span>
          </div>
        </div>
      </motion.div>
    );
  };

  const HealthScoreGauge = ({ score }) => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <div className="relative w-40 h-40 mx-auto">
        <svg className="transform -rotate-90 w-full h-full">
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
            fill="transparent"
          />
          <motion.circle
            cx="80"
            cy="80"
            r={radius}
            stroke="url(#healthGradient)"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{score}</div>
            <div className="text-xs text-gray-400">Health Score</div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Brain className="w-8 h-8 text-cyan-400" />
            Advanced Analytics
          </h1>
          <p className="text-gray-400 mt-2">AI-powered insights into your breathing health</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Time Frame Selector */}
          <select
            value={selectedTimeFrame}
            onChange={(e) => setSelectedTimeFrame(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 3 Months</option>
          </select>

          {/* Action Buttons */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 rounded-lg px-4 py-2 text-cyan-400 text-sm flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-lg px-4 py-2 text-blue-400 text-sm flex items-center gap-2 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share
          </motion.button>
        </div>
      </motion.div>

      {/* Health Score & Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-4 gap-6"
      >
        {/* Health Score Card */}
        <div className="lg:col-span-1">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
            <h3 className="text-white font-semibold mb-4">Overall Health Score</h3>
            <HealthScoreGauge score={analyticsData.healthScore} />
            <div className="mt-4">
              <div className="text-sm text-gray-400">Predicted next week</div>
              <div className="text-lg font-bold text-green-400">+{analyticsData.predictions.nextWeekScore - analyticsData.healthScore} points</div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              icon={Heart}
              title="Respiratory Rate"
              value={`${analyticsData.trends.respiratoryRate.current} BPM`}
              change={analyticsData.trends.respiratoryRate.change}
              trend={analyticsData.trends.respiratoryRate.trend}
              color="red"
            />
            <StatCard
              icon={Zap}
              title="Oxygen Efficiency"
              value={`${analyticsData.trends.oxygenEfficiency.current}%`}
              change={analyticsData.trends.oxygenEfficiency.change}
              trend={analyticsData.trends.oxygenEfficiency.trend}
              color="green"
            />
            <StatCard
              icon={Target}
              title="Stress Level"
              value={`${analyticsData.trends.stressLevel.current}%`}
              change={analyticsData.trends.stressLevel.change}
              trend={analyticsData.trends.stressLevel.trend}
              color="purple"
            />
          </div>
        </div>
      </motion.div>

      {/* Detailed Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Progress Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Weekly Progress</h3>
            <LineChart className="w-5 h-5 text-cyan-400" />
          </div>
          
          <div className="h-64 flex items-end justify-between space-x-2">
            {analyticsData.patterns.weeklyProgress.map((value, index) => (
              <motion.div
                key={index}
                initial={{ height: 0 }}
                animate={{ height: `${(value / 100) * 100}%` }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-gradient-to-t from-cyan-400 to-blue-500 rounded-t-lg flex-1 relative group"
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {value}%
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="flex justify-between mt-4 text-xs text-gray-400">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <span key={day}>{day}</span>
            ))}
          </div>
        </motion.div>

        {/* AI Insights & Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">AI Insights</h3>
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </div>
          
          <div className="space-y-4">
            {analyticsData.insights.map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <h4 className="text-white font-medium mb-3">Personalized Recommendations</h4>
            <div className="space-y-2">
              {analyticsData.predictions.recommendations.map((rec, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="text-sm text-gray-300 flex items-start space-x-2"
                >
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>{rec}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
          <Calendar className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
          <h4 className="text-white font-medium">Best Time</h4>
          <p className="text-2xl font-bold text-cyan-400 mt-2">{analyticsData.patterns.bestTimeOfDay}</p>
          <p className="text-xs text-gray-400 mt-1">Optimal recording time</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
          <Award className="w-8 h-8 text-green-400 mx-auto mb-3" />
          <h4 className="text-white font-medium">Consistency</h4>
          <p className="text-2xl font-bold text-green-400 mt-2">{analyticsData.patterns.consistencyScore}%</p>
          <p className="text-xs text-gray-400 mt-1">Pattern regularity</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
          <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-3" />
          <h4 className="text-white font-medium">Improvement</h4>
          <p className="text-2xl font-bold text-blue-400 mt-2">+{analyticsData.patterns.improvementRate}%</p>
          <p className="text-xs text-gray-400 mt-1">This month</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
          <Clock className="w-8 h-8 text-purple-400 mx-auto mb-3" />
          <h4 className="text-white font-medium">Sleep Quality</h4>
          <p className="text-2xl font-bold text-purple-400 mt-2">{analyticsData.trends.sleepQuality.current}%</p>
          <p className="text-xs text-gray-400 mt-1">
            {analyticsData.trends.sleepQuality.change > 0 ? '+' : ''}{analyticsData.trends.sleepQuality.change}% this week
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdvancedAnalytics;