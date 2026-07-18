package com.matchlens.backend.service;

import com.matchlens.backend.dto.MatchedListingBreakdownDTO;
import com.matchlens.backend.dto.MatchedListingDTO;
import com.matchlens.backend.entity.Listing;
import com.matchlens.backend.entity.Student;
import com.matchlens.backend.entity.WorkAuthStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class MatchingService {

    public MatchedListingDTO computeMatch(Student student, Listing listing) {
        List<String> studentSkills = student.getSkills() != null ? student.getSkills() : new ArrayList<>();
        List<String> requiredSkills = listing.getRequiredSkills() != null ? listing.getRequiredSkills() : new ArrayList<>();

        // skillMatchRatio = |student.skills ∩ listing.requiredSkills| / |listing.requiredSkills|
        List<String> matchedSkills = new ArrayList<>();
        for (String rs : requiredSkills) {
            for (String ss : studentSkills) {
                if (rs.equalsIgnoreCase(ss)) {
                    matchedSkills.add(rs);
                    break;
                }
            }
        }
        
        double skillMatchRatio = requiredSkills.isEmpty() ? 1.0 : (double) matchedSkills.size() / requiredSkills.size();

        // gpaMet = student.education.degree.cgpa >= listing.gpaThreshold
        boolean gpaMet = true;
        if (listing.getGpaThreshold() != null && student.getEducation() != null && student.getEducation().getDegree() != null) {
            Double studentCgpa = student.getEducation().getDegree().getCgpa();
            if (studentCgpa != null) {
                gpaMet = studentCgpa >= listing.getGpaThreshold();
            } else {
                gpaMet = false; // Missing CGPA means threshold not met
            }
        }

        // authCompatible = !listing.sponsorshipAvailable == false ? true : (student.workAuthStatus != NEEDS_SPONSORSHIP || listing.sponsorshipAvailable)
        boolean authCompatible = true;
        if (listing.getSponsorshipAvailable() != null && !listing.getSponsorshipAvailable() && student.getWorkAuthStatus() == WorkAuthStatus.NEEDS_SPONSORSHIP) {
            authCompatible = false;
        }

        // score = round((0.6 * skillMatchRatio + 0.2 * (gpaMet?1:0) + 0.2 * (authCompatible?1:0)) * 100)
        double scoreCalc = (0.6 * skillMatchRatio + 0.2 * (gpaMet ? 1 : 0) + 0.2 * (authCompatible ? 1 : 0)) * 100;
        int score = (int) Math.round(scoreCalc);

        MatchedListingBreakdownDTO breakdown = MatchedListingBreakdownDTO.builder()
                .skillMatch(skillMatchRatio * 100)
                .gpaMet(gpaMet)
                .authCompatible(authCompatible)
                .matchedSkills(matchedSkills)
                .build();

        return MatchedListingDTO.builder()
                .listingId(listing.getId())
                .title(listing.getTitle())
                .company(listing.getCompany())
                .location(listing.getLocation())
                .workMode(listing.getWorkMode())
                .employmentType(listing.getEmploymentType())
                .summary(listing.getSummary())
                .score(score)
                .breakdown(breakdown)
                .build();
    }
}
