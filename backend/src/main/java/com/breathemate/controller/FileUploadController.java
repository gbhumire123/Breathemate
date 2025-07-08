package com.breathemate.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/upload-audio")
public class FileUploadController {

    @PostMapping
    public Map<String, String> uploadAudio(@RequestParam("audio") MultipartFile file) {
        Map<String, String> response = new HashMap<>();
        try {
            // Save the file locally
            File savedFile = new File("uploads/" + file.getOriginalFilename());
            file.transferTo(savedFile);

            // Call Python script for prediction
            ProcessBuilder processBuilder = new ProcessBuilder("python3", "ml-model/predict.py", savedFile.getAbsolutePath());
            Process process = processBuilder.start();
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            StringBuilder output = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line);
            }
            reader.close();

            // Parse the output
            response.put("message", "File uploaded successfully");
            response.put("prediction", output.toString());
        } catch (Exception e) {
            response.put("message", "Failed to upload file");
            response.put("error", e.getMessage());
        }
        return response;
    }
}