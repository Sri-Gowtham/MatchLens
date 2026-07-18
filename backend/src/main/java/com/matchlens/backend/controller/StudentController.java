package com.matchlens.backend.controller;

import com.matchlens.backend.entity.Student;
import com.matchlens.backend.repository.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentRepository studentRepository;

    public StudentController(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    private Student getAuthenticatedStudent(Authentication authentication, UUID requestedId) {
        String email = authentication.getName();
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        
        if (!student.getId().equals(requestedId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return student;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudent(@PathVariable UUID id, Authentication authentication) {
        Student student = getAuthenticatedStudent(authentication, id);
        return ResponseEntity.ok(student);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable UUID id, @RequestBody Student updatedData, Authentication authentication) {
        Student existingStudent = getAuthenticatedStudent(authentication, id);
        
        // Update editable fields
        existingStudent.setName(updatedData.getName());
        existingStudent.setPhone(updatedData.getPhone());
        existingStudent.setCountry(updatedData.getCountry());
        existingStudent.setCity(updatedData.getCity());
        existingStudent.setAddress(updatedData.getAddress());
        existingStudent.setAbout(updatedData.getAbout());
        existingStudent.setWorkAuthStatus(updatedData.getWorkAuthStatus());
        existingStudent.setSkills(updatedData.getSkills());
        existingStudent.setEducation(updatedData.getEducation());
        existingStudent.setExperience(updatedData.getExperience());
        existingStudent.setLinks(updatedData.getLinks());
        
        // email and passwordHash remain unchanged unless specifically built in
        return ResponseEntity.ok(studentRepository.save(existingStudent));
    }
}
