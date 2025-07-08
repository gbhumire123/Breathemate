package com.breathemate.repository;

import com.breathemate.model.PredictionHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PredictionHistoryRepository extends JpaRepository<PredictionHistory, Long> {
}