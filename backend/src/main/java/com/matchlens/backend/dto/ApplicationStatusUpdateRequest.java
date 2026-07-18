package com.matchlens.backend.dto;

import com.matchlens.backend.entity.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationStatusUpdateRequest {
    private ApplicationStatus status;
}
