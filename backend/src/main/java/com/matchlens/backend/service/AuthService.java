package com.matchlens.backend.service;

import com.matchlens.backend.dto.AuthRequest;
import com.matchlens.backend.dto.AuthResponse;
import com.matchlens.backend.dto.RegisterRequest;
import com.matchlens.backend.entity.Student;
import com.matchlens.backend.repository.StudentRepository;
import com.matchlens.backend.security.JwtUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthService(StudentRepository studentRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils) {
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    public AuthResponse register(RegisterRequest request) {
        if (studentRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        Student student = new Student();
        student.setName(request.getName());
        student.setEmail(request.getEmail());
        student.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        
        Student savedStudent = studentRepository.save(student);
        String token = jwtUtils.generateToken(savedStudent.getEmail());
        
        return new AuthResponse(token, savedStudent.getId());
    }

    public AuthResponse login(AuthRequest request) {
        Optional<Student> studentOpt = studentRepository.findByEmail(request.getEmail());
        
        if (studentOpt.isEmpty() || !passwordEncoder.matches(request.getPassword(), studentOpt.get().getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }
        
        String token = jwtUtils.generateToken(studentOpt.get().getEmail());
        return new AuthResponse(token, studentOpt.get().getId());
    }
}
