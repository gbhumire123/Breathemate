package com.breathemate.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
public class PredictionHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;
    private LocalDateTime timestamp;
    private String riskLevel;
    
    // Enhanced fields for advanced analytics
    private Double healthScore;
    private Double breathingRate;
    private Double oxygenSaturation;
    private String breathingPattern;
    private Boolean wheezingDetected;
    private Boolean cracklingDetected;
    private String irregularityType;
    private Double stressLevel;
    private String recommendations;
    private String audioFileName;
    private Integer duration; // in seconds
    
    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public Double getHealthScore() {
        return healthScore;
    }

    public void setHealthScore(Double healthScore) {
        this.healthScore = healthScore;
    }

    public Double getBreathingRate() {
        return breathingRate;
    }

    public void setBreathingRate(Double breathingRate) {
        this.breathingRate = breathingRate;
    }

    public Double getOxygenSaturation() {
        return oxygenSaturation;
    }

    public void setOxygenSaturation(Double oxygenSaturation) {
        this.oxygenSaturation = oxygenSaturation;
    }

    public String getBreathingPattern() {
        return breathingPattern;
    }

    public void setBreathingPattern(String breathingPattern) {
        this.breathingPattern = breathingPattern;
    }

    public Boolean getWheezingDetected() {
        return wheezingDetected;
    }

    public void setWheezingDetected(Boolean wheezingDetected) {
        this.wheezingDetected = wheezingDetected;
    }

    public Boolean getCracklingDetected() {
        return cracklingDetected;
    }

    public void setCracklingDetected(Boolean cracklingDetected) {
        this.cracklingDetected = cracklingDetected;
    }

    public String getIrregularityType() {
        return irregularityType;
    }

    public void setIrregularityType(String irregularityType) {
        this.irregularityType = irregularityType;
    }

    public Double getStressLevel() {
        return stressLevel;
    }

    public void setStressLevel(Double stressLevel) {
        this.stressLevel = stressLevel;
    }

    public String getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(String recommendations) {
        this.recommendations = recommendations;
    }

    public String getAudioFileName() {
        return audioFileName;
    }

    public void setAudioFileName(String audioFileName) {
        this.audioFileName = audioFileName;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }
}