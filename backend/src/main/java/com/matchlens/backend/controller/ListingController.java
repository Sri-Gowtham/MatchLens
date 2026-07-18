package com.matchlens.backend.controller;

import com.matchlens.backend.dto.MatchedListingDTO;
import com.matchlens.backend.entity.EmploymentType;
import com.matchlens.backend.entity.Listing;
import com.matchlens.backend.entity.Student;
import com.matchlens.backend.entity.WorkMode;
import com.matchlens.backend.repository.ListingRepository;
import com.matchlens.backend.repository.StudentRepository;
import com.matchlens.backend.service.MatchingService;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/listings")
public class ListingController {

    private final ListingRepository listingRepository;
    private final StudentRepository studentRepository;
    private final MatchingService matchingService;

    public ListingController(ListingRepository listingRepository, StudentRepository studentRepository, MatchingService matchingService) {
        this.listingRepository = listingRepository;
        this.studentRepository = studentRepository;
        this.matchingService = matchingService;
    }

    @GetMapping("/matched")
    public ResponseEntity<List<MatchedListingDTO>> getMatchedListings(
            @RequestParam(required = false) UUID studentId,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) WorkMode mode,
            @RequestParam(required = false) EmploymentType employmentType,
            @RequestParam(required = false) Boolean sponsorship,
            Authentication authentication
    ) {
        // Auth Check
        String email = authentication.getName();
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        
        // Use student ID from token if param not provided, else validate
        UUID finalStudentId = studentId != null ? studentId : student.getId();
        if (!student.getId().equals(finalStudentId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        // Fetch and Filter Listings
        Specification<Listing> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (role != null && !role.isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("title")), "%" + role.toLowerCase() + "%"));
            }
            if (location != null && !location.isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("location")), "%" + location.toLowerCase() + "%"));
            }
            if (mode != null) {
                predicates.add(cb.equal(root.get("workMode"), mode));
            }
            if (employmentType != null) {
                predicates.add(cb.equal(root.get("employmentType"), employmentType));
            }
            if (sponsorship != null) {
                predicates.add(cb.equal(root.get("sponsorshipAvailable"), sponsorship));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        List<Listing> listings = listingRepository.findAll(spec);
        
        List<MatchedListingDTO> matched = listings.stream()
                .map(listing -> matchingService.computeMatch(student, listing))
                .sorted((a, b) -> b.getScore().compareTo(a.getScore())) // descending
                .collect(Collectors.toList());

        return ResponseEntity.ok(matched);
    }
}
