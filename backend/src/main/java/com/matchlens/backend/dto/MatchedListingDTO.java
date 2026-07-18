package com.matchlens.backend.dto;

import com.matchlens.backend.entity.EmploymentType;
import com.matchlens.backend.entity.WorkMode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchedListingDTO {
    private UUID listingId;
    private String title;
    private String company;
    private String location;
    private WorkMode workMode;
    private EmploymentType employmentType;
    private String summary;
    private Integer score;
    private MatchedListingBreakdownDTO breakdown;
}
