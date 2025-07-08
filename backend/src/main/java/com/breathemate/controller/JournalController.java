package com.breathemate.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.breathemate.model.JournalEntry;
import com.breathemate.repository.JournalRepository;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/journal")
public class JournalController {

    @Autowired
    private JournalRepository journalRepository;

    private static final Logger logger = LoggerFactory.getLogger(JournalController.class);

    @GetMapping
    public List<JournalEntry> getAllEntries() {
        try {
            return journalRepository.findAll();
        } catch (Exception e) {
            logger.error("Error fetching journal entries: {}", e.getMessage());
            throw e;
        }
    }

    @PostMapping
    public JournalEntry addEntry(@RequestBody JournalEntry entry) {
        try {
            return journalRepository.save(entry);
        } catch (Exception e) {
            logger.error("Error adding journal entry: {}", e.getMessage());
            throw e;
        }
    }

    @DeleteMapping("/{id}")
    public String deleteEntry(@PathVariable Long id) {
        try {
            Optional<JournalEntry> entry = journalRepository.findById(id);
            if (entry.isPresent()) {
                journalRepository.delete(entry.get());
                return "Entry deleted successfully";
            } else {
                return "Entry not found";
            }
        } catch (Exception e) {
            logger.error("Error deleting journal entry: {}", e.getMessage());
            throw e;
        }
    }
}