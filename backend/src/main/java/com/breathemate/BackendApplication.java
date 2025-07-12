package com.breathemate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.breathemate.model.User;
import com.breathemate.repository.UserRepository;

@SpringBootApplication
public class BackendApplication implements CommandLineRunner {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private BCryptPasswordEncoder passwordEncoder;

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	@Override
	public void run(String... args) throws Exception {
		// Create demo user if it doesn't exist
		if (userRepository.findByEmail("demo@breathemate.com") == null) {
			User demoUser = new User();
			demoUser.setEmail("demo@breathemate.com");
			demoUser.setPassword(passwordEncoder.encode("demo123"));
			userRepository.save(demoUser);
			System.out.println("Demo user created: demo@breathemate.com / demo123");
		}
	}
}