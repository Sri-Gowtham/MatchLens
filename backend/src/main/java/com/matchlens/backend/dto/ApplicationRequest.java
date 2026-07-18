package com.matchlens.backend.dto;

import com.matchlens.backend.entity.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationRequest {
    private UUID studentId;
    private UUID listingId;
    private ApplicationStatus status;
}
