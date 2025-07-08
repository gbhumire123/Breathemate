package com.breathemate.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.breathemate.model.PredictionHistory;
import com.breathemate.repository.PredictionHistoryRepository;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/prediction-history")
public class PredictionHistoryController {

    @Autowired
    private PredictionHistoryRepository predictionHistoryRepository;

    private static final Logger logger = LoggerFactory.getLogger(PredictionHistoryController.class);

    @GetMapping
    public List<PredictionHistory> getPredictionHistory() {
        try {
            return predictionHistoryRepository.findAll();
        } catch (Exception e) {
            logger.error("Error fetching prediction history: {}", e.getMessage());
            throw e;
        }
    }
}