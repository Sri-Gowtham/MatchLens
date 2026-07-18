package com.matchlens.backend.controller;

import com.matchlens.backend.dto.ApplicationRequest;
import com.matchlens.backend.dto.ApplicationStatusUpdateRequest;
import com.matchlens.backend.entity.Application;
import com.matchlens.backend.entity.Listing;
import com.matchlens.backend.entity.Student;
import com.matchlens.backend.repository.ApplicationRepository;
import com.matchlens.backend.repository.ListingRepository;
import com.matchlens.backend.repository.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationRepository applicationRepository;
    private final StudentRepository studentRepository;
    private final ListingRepository listingRepository;

    public ApplicationController(ApplicationRepository applicationRepository, StudentRepository studentRepository, ListingRepository listingRepository) {
        this.applicationRepository = applicationRepository;
        this.studentRepository = studentRepository;
        this.listingRepository = listingRepository;
    }

    private Student getAuthenticatedStudent(Authentication authentication) {
        String email = authentication.getName();
        return studentRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    @PostMapping
    public ResponseEntity<Application> createApplication(@RequestBody ApplicationRequest request, Authentication authentication) {
        Student student = getAuthenticatedStudent(authentication);
        
        if (!student.getId().equals(request.getStudentId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot apply for another student");
        }

        Listing listing = listingRepository.findById(request.getListingId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found"));

        Application app = new Application();
        app.setStudent(student);
        app.setListing(listing);
        app.setStatus(request.getStatus());
        
        return ResponseEntity.ok(applicationRepository.save(app));
    }

    @GetMapping
    public ResponseEntity<List<Application>> getApplications(@RequestParam UUID studentId, Authentication authentication) {
        Student student = getAuthenticatedStudent(authentication);
        if (!student.getId().equals(studentId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        
        return ResponseEntity.ok(applicationRepository.findByStudentId(studentId));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Application> updateApplicationStatus(
            @PathVariable UUID id,
            @RequestBody ApplicationStatusUpdateRequest request,
            Authentication authentication
    ) {
        Student student = getAuthenticatedStudent(authentication);
        
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));

        if (!app.getStudent().getId().equals(student.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        app.setStatus(request.getStatus());
        return ResponseEntity.ok(applicationRepository.save(app));
    }
}
