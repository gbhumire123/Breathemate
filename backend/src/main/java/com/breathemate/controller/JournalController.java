package com.breathemate.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.breathemate.model.JournalEntry;
import com.breathemate.repository.JournalRepository;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/journal")
public class JournalController {

    @Autowired
    private JournalRepository journalRepository;

    @GetMapping
    public List<JournalEntry> getAllEntries() {
        return journalRepository.findAll();
    }

    @PostMapping
    public JournalEntry addEntry(@RequestBody JournalEntry entry) {
        return journalRepository.save(entry);
    }

    @DeleteMapping("/{id}")
    public String deleteEntry(@PathVariable Long id) {
        Optional<JournalEntry> entry = journalRepository.findById(id);
        if (entry.isPresent()) {
            journalRepository.delete(entry.get());
            return "Entry deleted successfully";
        } else {
            return "Entry not found";
        }
    }
}