package com.breathemate.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.breathemate.model.PredictionHistory;
import com.breathemate.repository.PredictionHistoryRepository;

import java.util.List;

@RestController
@RequestMapping("/api/prediction-history")
public class PredictionHistoryController {

    @Autowired
    private PredictionHistoryRepository predictionHistoryRepository;

    @GetMapping
    public List<PredictionHistory> getAllHistory() {
        return predictionHistoryRepository.findAll();
    }
}