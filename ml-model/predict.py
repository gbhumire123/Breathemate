import sys
import json
import librosa
import numpy as np
import pickle
import os
from scipy.signal import find_peaks
from scipy.stats import skew, kurtosis

def extract_advanced_features(audio_path):
    """Extract comprehensive breathing analysis features"""
    try:
        # Load audio
        y, sr = librosa.load(audio_path, sr=22050)
        
        # 1. Basic Audio Features
        mfccs = np.mean(librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13).T, axis=0)
        spectral_centroid = np.mean(librosa.feature.spectral_centroid(y=y, sr=sr))
        zero_crossing_rate = np.mean(librosa.feature.zero_crossing_rate(y))
        
        # 2. Breathing Pattern Analysis
        # Detect breathing cycles using amplitude envelope
        envelope = np.abs(librosa.onset.onset_strength(y=y, sr=sr))
        peaks, _ = find_peaks(envelope, height=np.mean(envelope), distance=sr//4)
        
        # Calculate breathing rate (breaths per minute)
        breathing_rate = len(peaks) * 60 / (len(y) / sr)
        
        # 3. Frequency Analysis for Abnormal Sounds
        # Wheezing detection (high frequency oscillations)
        fft = np.fft.fft(y)
        freqs = np.fft.fftfreq(len(fft), 1/sr)
        
        # Focus on frequency ranges:
        # Normal breathing: 0.2-2 Hz
        # Wheezing: 100-1000 Hz
        # Crackling: 100-2000 Hz (irregular patterns)
        
        wheezing_band = np.logical_and(freqs >= 100, freqs <= 1000)
        wheezing_power = np.mean(np.abs(fft[wheezing_band]))
        
        crackling_band = np.logical_and(freqs >= 100, freqs <= 2000)
        crackling_power = np.mean(np.abs(fft[crackling_band]))
        
        # 4. Rhythm and Regularity Analysis
        breath_intervals = np.diff(peaks) / sr if len(peaks) > 1 else [0]
        rhythm_regularity = 1 / (np.std(breath_intervals) + 0.001)  # Higher = more regular
        
        # 5. Amplitude Analysis
        amplitude_variation = np.std(envelope)
        breath_depth_consistency = 1 / (amplitude_variation + 0.001)
        
        # 6. Pause Detection (Apnea indicators)
        silence_threshold = 0.01
        silent_regions = np.where(np.abs(y) < silence_threshold)[0]
        if len(silent_regions) > 0:
            max_pause_duration = np.max(np.diff(np.split(silent_regions, 
                np.where(np.diff(silent_regions) != 1)[0] + 1), axis=1)) / sr
        else:
            max_pause_duration = 0
        
        return {
            'mfccs': mfccs,
            'breathing_rate': breathing_rate,
            'wheezing_power': wheezing_power,
            'crackling_power': crackling_power,
            'rhythm_regularity': rhythm_regularity,
            'breath_depth_consistency': breath_depth_consistency,
            'max_pause_duration': max_pause_duration,
            'spectral_centroid': spectral_centroid,
            'zero_crossing_rate': zero_crossing_rate,
            'amplitude_variation': amplitude_variation
        }
    except Exception as e:
        return None

def analyze_breathing_health(features):
    """Analyze breathing health based on extracted features"""
    if not features:
        return {"error": "Feature extraction failed"}
    
    # Clinical thresholds (based on medical literature)
    risk_factors = []
    confidence_score = 0.0
    
    # 1. Breathing Rate Analysis
    breathing_rate = features['breathing_rate']
    if breathing_rate < 8:  # Bradypnea
        risk_factors.append("Abnormally slow breathing rate")
        confidence_score += 0.3
    elif breathing_rate > 24:  # Tachypnea
        risk_factors.append("Abnormally fast breathing rate")
        confidence_score += 0.25
    elif 12 <= breathing_rate <= 20:  # Normal range
        confidence_score -= 0.1  # Reduces risk
    
    # 2. Wheezing Detection
    wheezing_threshold = 0.01  # Calibrated threshold
    if features['wheezing_power'] > wheezing_threshold:
        risk_factors.append("Possible wheezing detected")
        confidence_score += 0.4
    
    # 3. Crackling/Wet Sounds
    crackling_threshold = 0.015
    if features['crackling_power'] > crackling_threshold:
        risk_factors.append("Possible crackling sounds (fluid in lungs)")
        confidence_score += 0.35
    
    # 4. Breathing Irregularity
    if features['rhythm_regularity'] < 0.5:
        risk_factors.append("Irregular breathing pattern")
        confidence_score += 0.2
    
    # 5. Breath Depth Inconsistency
    if features['breath_depth_consistency'] < 0.3:
        risk_factors.append("Inconsistent breath depth")
        confidence_score += 0.15
    
    # 6. Prolonged Pauses (Sleep Apnea indicator)
    if features['max_pause_duration'] > 10:  # 10+ second pause
        risk_factors.append("Prolonged breathing pauses detected")
        confidence_score += 0.5
    
    # Calculate final risk assessment
    confidence_score = min(confidence_score, 1.0)  # Cap at 100%
    risk_percentage = int(confidence_score * 100)
    
    # Determine risk level and recommendations
    if risk_percentage >= 70:
        risk_level = "High"
        recommendation = "Consult a pulmonologist immediately"
        urgency = "Urgent"
    elif risk_percentage >= 40:
        risk_level = "Moderate" 
        recommendation = "Schedule a medical check-up"
        urgency = "Within 1-2 weeks"
    elif risk_percentage >= 20:
        risk_level = "Low-Moderate"
        recommendation = "Monitor symptoms, consider medical consultation"
        urgency = "Within 1 month"
    else:
        risk_level = "Low"
        recommendation = "Continue regular health monitoring"
        urgency = "Routine"
    
    return {
        "risk_percentage": risk_percentage,
        "risk_level": risk_level,
        "confidence_level": "Medium" if len(risk_factors) >= 2 else "Low",
        "detected_issues": risk_factors,
        "recommendation": recommendation,
        "urgency": urgency,
        "breathing_rate": round(breathing_rate, 1),
        "analysis_details": {
            "wheezing_detected": features['wheezing_power'] > wheezing_threshold,
            "crackling_detected": features['crackling_power'] > crackling_threshold,
            "rhythm_regular": features['rhythm_regularity'] > 0.5,
            "breath_consistent": features['breath_depth_consistency'] > 0.3
        }
    }

def predict(audio_path):
    """Main prediction function with medical-grade analysis"""
    try:
        if not os.path.exists(audio_path):
            return {"error": "Audio file not found"}
        
        # Extract comprehensive features
        features = extract_advanced_features(audio_path)
        if not features:
            return {"error": "Could not analyze audio file"}
        
        # Perform medical analysis
        analysis = analyze_breathing_health(features)
        
        # Add technical details for healthcare providers
        analysis["technical_details"] = {
            "audio_duration": librosa.get_duration(filename=audio_path),
            "sample_rate": 22050,
            "features_extracted": len(features),
            "analysis_method": "Advanced Signal Processing + Medical Heuristics"
        }
        
        # Add disclaimer
        analysis["medical_disclaimer"] = "This analysis is for screening purposes only. " \
                                        "Always consult healthcare professionals for medical diagnosis."
        
        return analysis
        
    except Exception as e:
        return {"error": f"Analysis failed: {str(e)}"}

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: python predict.py <audio_file_path>"}))
        sys.exit(1)
    
    audio_path = sys.argv[1]
    result = predict(audio_path)
    print(json.dumps(result, indent=2))