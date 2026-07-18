package com.matchlens.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "students")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    private String phone;
    private String country;
    private String city;
    private String address;

    @Column(length = 1000)
    private String about;

    @Enumerated(EnumType.STRING)
    private WorkAuthStatus workAuthStatus;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private List<String> skills;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private Education education;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private List<Experience> experience;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private Links links;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Education {
        private Degree degree;
        private Hsc hsc;
        private Ssc ssc;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Degree {
        private String institution;
        private String degreeName;
        private String branch;
        private String graduationMonthYear;
        private Double cgpa;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Hsc {
        private String schoolName;
        private Double percentage;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Ssc {
        private String schoolName;
        private Double percentage;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Experience {
        private String id;
        private String company;
        private String role;
        private String startDate;
        private String endDate;
        private Boolean current;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Links {
        private String resumeUrl;
        private String linkedin;
        private String github;
        private List<LinkItem> others;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LinkItem {
        private String label;
        private String url;
    }
}
