import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ReportScreen = ({ navigation }) => {
  const [timeRange, setTimeRange] = useState('week');
  const [healthData, setHealthData] = useState({
    totalSessions: 24,
    averageScore: 82,
    improvementTrend: 12,
    riskReduction: 15,
    weeklyData: [78, 85, 82, 90, 88, 84, 87],
    monthlyData: [80, 82, 85, 87, 89, 88, 90, 92],
    riskDistribution: { low: 18, moderate: 5, high: 1 },
    symptoms: {
      'Shortness of breath': 3,
      'Chest tightness': 1,
      'Wheezing': 0,
      'Cough': 2,
      'Fatigue': 4,
    }
  });

  const timeRanges = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: '3 Months' },
    { value: 'year', label: 'This Year' },
  ];

  const getScoreColor = (score) => {
    if (score >= 85) return '#00ff88';
    if (score >= 70) return '#00ffff';
    if (score >= 50) return '#ffaa00';
    return '#ff6b6b';
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return 'trending-up';
    if (trend < 0) return 'trending-down';
    return 'remove';
  };

  const getTrendColor = (trend) => {
    if (trend > 0) return '#00ff88';
    if (trend < 0) return '#ff6b6b';
    return '#888';
  };

  const SimpleChart = ({ data, height = 100 }) => {
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const range = maxValue - minValue || 1;

    return (
      <View style={[styles.chartContainer, { height }]}>
        <View style={styles.chart}>
          {data.map((value, index) => {
            const barHeight = ((value - minValue) / range) * (height - 40);
            return (
              <View key={index} style={styles.chartBar}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(barHeight, 5),
                      backgroundColor: getScoreColor(value),
                    }
                  ]}
                />
                <Text style={styles.chartValue}>{value}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const RiskPieChart = ({ data }) => {
    const total = data.low + data.moderate + data.high;
    const lowPercent = (data.low / total * 100).toFixed(0);
    const moderatePercent = (data.moderate / total * 100).toFixed(0);
    const highPercent = (data.high / total * 100).toFixed(0);

    return (
      <View style={styles.pieChartContainer}>
        <View style={styles.pieChart}>
          <View style={[styles.pieSlice, styles.pieSliceLow, { flex: data.low }]} />
          <View style={[styles.pieSlice, styles.pieSliceModerate, { flex: data.moderate }]} />
          <View style={[styles.pieSlice, styles.pieSliceHigh, { flex: data.high }]} />
        </View>
        <View style={styles.pieLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#00ff88' }]} />
            <Text style={styles.legendText}>Low Risk ({lowPercent}%)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#ffaa00' }]} />
            <Text style={styles.legendText}>Moderate ({moderatePercent}%)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#ff6b6b' }]} />
            <Text style={styles.legendText}>High Risk ({highPercent}%)</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#0f0f0f', '#1a1a1a', '#2d2d2d']}
      style={styles.container}
    >
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Health Reports</Text>
        <Text style={styles.subtitle}>Track your progress and insights</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.timeRangeScrollContent}
          >
            {timeRanges.map((range) => (
              <TouchableOpacity
                key={range.value}
                style={[
                  styles.timeRangeButton,
                  timeRange === range.value && styles.timeRangeButtonActive
                ]}
                onPress={() => setTimeRange(range.value)}
              >
                <Text style={[
                  styles.timeRangeText,
                  timeRange === range.value && styles.timeRangeTextActive
                ]}>
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsContainer}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Ionicons name="pulse" size={24} color="#00ffff" />
              <Text style={styles.metricValue}>{healthData.totalSessions}</Text>
              <Text style={styles.metricLabel}>Total Sessions</Text>
            </View>

            <View style={styles.metricCard}>
              <Ionicons name="analytics" size={24} color="#00ff88" />
              <Text style={[styles.metricValue, { color: getScoreColor(healthData.averageScore) }]}>
                {healthData.averageScore}
              </Text>
              <Text style={styles.metricLabel}>Avg Score</Text>
            </View>

            <View style={styles.metricCard}>
              <Ionicons 
                name={getTrendIcon(healthData.improvementTrend)} 
                size={24} 
                color={getTrendColor(healthData.improvementTrend)} 
              />
              <Text style={[styles.metricValue, { color: getTrendColor(healthData.improvementTrend) }]}>
                {healthData.improvementTrend > 0 ? '+' : ''}{healthData.improvementTrend}%
              </Text>
              <Text style={styles.metricLabel}>Improvement</Text>
            </View>

            <View style={styles.metricCard}>
              <Ionicons name="shield-checkmark" size={24} color="#aa6bff" />
              <Text style={styles.metricValue}>{healthData.riskReduction}%</Text>
              <Text style={styles.metricLabel}>Risk Reduction</Text>
            </View>
          </View>
        </View>

        {/* Score Trends */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Score Trends</Text>
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Weekly Progress</Text>
            <SimpleChart data={healthData.weeklyData} height={120} />
          </View>
        </View>

        {/* Risk Analysis */}
        <View style={styles.riskSection}>
          <Text style={styles.sectionTitle}>Risk Analysis</Text>
          <View style={styles.riskCard}>
            <Text style={styles.chartTitle}>Risk Distribution</Text>
            <RiskPieChart data={healthData.riskDistribution} />
          </View>
        </View>

        {/* Symptoms Tracking */}
        <View style={styles.symptomsSection}>
          <Text style={styles.sectionTitle}>Symptoms Tracking</Text>
          <View style={styles.symptomsCard}>
            <Text style={styles.chartTitle}>Most Common Symptoms</Text>
            <View style={styles.symptomsList}>
              {Object.entries(healthData.symptoms).map(([symptom, count]) => (
                <View key={symptom} style={styles.symptomItem}>
                  <View style={styles.symptomInfo}>
                    <Text style={styles.symptomName}>{symptom}</Text>
                    <Text style={styles.symptomCount}>{count} times</Text>
                  </View>
                  <View style={styles.symptomBar}>
                    <View 
                      style={[
                        styles.symptomBarFill,
                        { 
                          width: `${(count / Math.max(...Object.values(healthData.symptoms))) * 100}%`,
                          backgroundColor: count > 3 ? '#ff6b6b' : count > 1 ? '#ffaa00' : '#00ff88'
                        }
                      ]} 
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Health Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Health Insights</Text>
          
          <View style={styles.insightCard}>
            <LinearGradient
              colors={['rgba(0, 255, 136, 0.1)', 'rgba(0, 255, 136, 0.05)']}
              style={styles.insightGradient}
            >
              <Ionicons name="checkmark-circle" size={24} color="#00ff88" />
              <Text style={styles.insightTitle}>Great Progress!</Text>
              <Text style={styles.insightText}>
                Your breathing health has improved by 12% this week. Keep up the regular monitoring!
              </Text>
            </LinearGradient>
          </View>

          <View style={styles.insightCard}>
            <LinearGradient
              colors={['rgba(255, 170, 0, 0.1)', 'rgba(255, 170, 0, 0.05)']}
              style={styles.insightGradient}
            >
              <Ionicons name="warning" size={24} color="#ffaa00" />
              <Text style={styles.insightTitle}>Monitor Fatigue</Text>
              <Text style={styles.insightText}>
                You've reported fatigue 4 times this period. Consider discussing this with your healthcare provider.
              </Text>
            </LinearGradient>
          </View>

          <View style={styles.insightCard}>
            <LinearGradient
              colors={['rgba(0, 255, 255, 0.1)', 'rgba(0, 255, 255, 0.05)']}
              style={styles.insightGradient}
            >
              <Ionicons name="bulb" size={24} color="#00ffff" />
              <Text style={styles.insightTitle}>Tip of the Week</Text>
              <Text style={styles.insightText}>
                Try recording your breathing at the same time each day for more consistent tracking.
              </Text>
            </LinearGradient>
          </View>
        </View>

        {/* Export Options */}
        <View style={styles.exportSection}>
          <Text style={styles.sectionTitle}>Export Data</Text>
          <View style={styles.exportButtons}>
            <TouchableOpacity style={styles.exportButton}>
              <LinearGradient
                colors={['#00ffff', '#0080ff']}
                style={styles.exportGradient}
              >
                <Ionicons name="document-text" size={20} color="#fff" />
                <Text style={styles.exportText}>PDF Report</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.exportButton}>
              <LinearGradient
                colors={['#00ff88', '#00cc66']}
                style={styles.exportGradient}
              >
                <Ionicons name="share" size={20} color="#fff" />
                <Text style={styles.exportText}>Share with Doctor</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  timeRangeContainer: {
    marginBottom: 30,
  },
  timeRangeScrollContent: {
    paddingRight: 20,
  },
  timeRangeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
  },
  timeRangeButtonActive: {
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    borderColor: '#00ffff',
  },
  timeRangeText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  timeRangeTextActive: {
    color: '#00ffff',
  },
  metricsContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: (width - 50) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.1)',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 10,
  },
  metricLabel: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  chartSection: {
    marginBottom: 30,
  },
  chartCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.1)',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  chartContainer: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100%',
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  bar: {
    width: '80%',
    borderRadius: 4,
    marginBottom: 5,
  },
  chartValue: {
    fontSize: 10,
    color: '#888',
  },
  riskSection: {
    marginBottom: 30,
  },
  riskCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.1)',
  },
  pieChartContainer: {
    alignItems: 'center',
  },
  pieChart: {
    flexDirection: 'row',
    width: 200,
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  pieSlice: {
    height: '100%',
  },
  pieSliceLow: {
    backgroundColor: '#00ff88',
  },
  pieSliceModerate: {
    backgroundColor: '#ffaa00',
  },
  pieSliceHigh: {
    backgroundColor: '#ff6b6b',
  },
  pieLegend: {
    alignItems: 'flex-start',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  legendText: {
    fontSize: 12,
    color: '#ccc',
  },
  symptomsSection: {
    marginBottom: 30,
  },
  symptomsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.1)',
  },
  symptomsList: {
    gap: 15,
  },
  symptomItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  symptomInfo: {
    flex: 1,
    marginRight: 15,
  },
  symptomName: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  symptomCount: {
    fontSize: 12,
    color: '#888',
  },
  symptomBar: {
    width: 80,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
  },
  symptomBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  insightsSection: {
    marginBottom: 30,
  },
  insightCard: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  insightGradient: {
    padding: 20,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  exportSection: {
    marginBottom: 30,
  },
  exportButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  exportButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  exportGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 8,
  },
  exportText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ReportScreen;