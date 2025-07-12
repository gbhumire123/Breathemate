package com.breathemate.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "breath_tests")
public class BreathTest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "test_type", nullable = false)
    private String testType;
    
    @Column(name = "duration_seconds")
    private Double durationSeconds;
    
    @Column(name = "average_frequency")
    private Double averageFrequency;
    
    @Column(name = "frequency_stability")
    private Double frequencyStability;
    
    @Column(name = "amplitude_consistency")
    private Double amplitudeConsistency;
    
    @Column(name = "breath_rate")
    private Double breathRate;
    
    @Column(name = "overall_score")
    private Double overallScore;
    
    @Column(name = "audio_file_path")
    private String audioFilePath;
    
    @Column(name = "analysis_data", columnDefinition = "TEXT")
    private String analysisData;
    
    @Column(name = "recommendations", columnDefinition = "TEXT")
    private String recommendations;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    // Constructors
    public BreathTest() {}
    
    public BreathTest(User user, String testType) {
        this.user = user;
        this.testType = testType;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public String getTestType() { return testType; }
    public void setTestType(String testType) { this.testType = testType; }
    
    public Double getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Double durationSeconds) { this.durationSeconds = durationSeconds; }
    
    public Double getAverageFrequency() { return averageFrequency; }
    public void setAverageFrequency(Double averageFrequency) { this.averageFrequency = averageFrequency; }
    
    public Double getFrequencyStability() { return frequencyStability; }
    public void setFrequencyStability(Double frequencyStability) { this.frequencyStability = frequencyStability; }
    
    public Double getAmplitudeConsistency() { return amplitudeConsistency; }
    public void setAmplitudeConsistency(Double amplitudeConsistency) { this.amplitudeConsistency = amplitudeConsistency; }
    
    public Double getBreathRate() { return breathRate; }
    public void setBreathRate(Double breathRate) { this.breathRate = breathRate; }
    
    public Double getOverallScore() { return overallScore; }
    public void setOverallScore(Double overallScore) { this.overallScore = overallScore; }
    
    public String getAudioFilePath() { return audioFilePath; }
    public void setAudioFilePath(String audioFilePath) { this.audioFilePath = audioFilePath; }
    
    public String getAnalysisData() { return analysisData; }
    public void setAnalysisData(String analysisData) { this.analysisData = analysisData; }
    
    public String getRecommendations() { return recommendations; }
    public void setRecommendations(String recommendations) { this.recommendations = recommendations; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}