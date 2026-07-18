package com.matchlens.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchedListingBreakdownDTO {
    private Double skillMatch;
    private Boolean gpaMet;
    private Boolean authCompatible;
    private List<String> matchedSkills;
}
