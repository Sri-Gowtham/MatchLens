package com.matchlens.backend.config;

import com.matchlens.backend.entity.EmploymentType;
import com.matchlens.backend.entity.Listing;
import com.matchlens.backend.entity.WorkMode;
import com.matchlens.backend.repository.ListingRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataLoader implements CommandLineRunner {

    private final ListingRepository listingRepository;

    public DataLoader(ListingRepository listingRepository) {
        this.listingRepository = listingRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (listingRepository.count() == 0) {
            System.out.println("Seeding listing data...");
            
            List<Listing> listings = Arrays.asList(
                    createListing("Software Engineering Intern", "Google", "Mountain View, CA", WorkMode.HYBRID, EmploymentType.INTERNSHIP_STIPEND, Arrays.asList("Java", "Python", "Data Structures"), 3.5, true, "Join our team to build scalable systems."),
                    createListing("Frontend Developer", "Meta", "Remote", WorkMode.REMOTE, EmploymentType.FULL_TIME, Arrays.asList("React", "JavaScript", "TypeScript"), 3.2, false, "Help us build the next generation of web interfaces."),
                    createListing("Data Science Intern", "Amazon", "Seattle, WA", WorkMode.ONSITE, EmploymentType.INTERNSHIP_STIPEND, Arrays.asList("Python", "Machine Learning", "SQL"), 3.7, true, "Apply machine learning to solve complex business problems."),
                    createListing("Backend Engineer", "Netflix", "Los Gatos, CA", WorkMode.ONSITE, EmploymentType.FULL_TIME, Arrays.asList("Java", "Spring Boot", "Microservices"), 3.0, true, "Build highly available backend systems for streaming."),
                    createListing("UI/UX Designer Intern", "Apple", "Cupertino, CA", WorkMode.ONSITE, EmploymentType.INTERNSHIP_UNPAID, Arrays.asList("Figma", "UI Design", "Prototyping"), 3.0, false, "Design beautiful and intuitive user experiences."),
                    createListing("DevOps Engineer", "Microsoft", "Redmond, WA", WorkMode.HYBRID, EmploymentType.FULL_TIME, Arrays.asList("Kubernetes", "Docker", "Azure"), 3.0, true, "Maintain and improve our cloud infrastructure."),
                    createListing("Product Manager Intern", "Airbnb", "San Francisco, CA", WorkMode.HYBRID, EmploymentType.INTERNSHIP_STIPEND, Arrays.asList("Agile", "Product Strategy", "Data Analysis"), 3.4, false, "Help guide the vision for our upcoming features."),
                    createListing("Full Stack Developer", "Stripe", "Remote", WorkMode.REMOTE, EmploymentType.FULL_TIME, Arrays.asList("Ruby", "React", "PostgreSQL"), 3.0, true, "Build seamless payment experiences."),
                    createListing("Machine Learning Engineer", "OpenAI", "San Francisco, CA", WorkMode.ONSITE, EmploymentType.FULL_TIME, Arrays.asList("Python", "PyTorch", "Deep Learning"), 3.8, true, "Advance the state of artificial intelligence."),
                    createListing("Security Analyst", "CrowdStrike", "Austin, TX", WorkMode.HYBRID, EmploymentType.FULL_TIME, Arrays.asList("Cybersecurity", "Network Security", "Python"), 3.0, false, "Protect systems from advanced cyber threats."),
                    createListing("Mobile App Developer Intern", "Uber", "San Francisco, CA", WorkMode.ONSITE, EmploymentType.INTERNSHIP_STIPEND, Arrays.asList("Swift", "iOS", "Kotlin"), 3.3, true, "Build features for millions of riders and drivers."),
                    createListing("Cloud Architect", "AWS", "Seattle, WA", WorkMode.HYBRID, EmploymentType.FULL_TIME, Arrays.asList("AWS", "Architecture", "Cloud Migration"), 3.0, true, "Design robust cloud solutions for enterprise clients."),
                    createListing("Data Engineer", "Snowflake", "San Mateo, CA", WorkMode.HYBRID, EmploymentType.FULL_TIME, Arrays.asList("SQL", "Data Warehousing", "Python"), 3.5, false, "Build high-performance data pipelines."),
                    createListing("QA Tester Intern", "EA Games", "Redwood City, CA", WorkMode.ONSITE, EmploymentType.INTERNSHIP_UNPAID, Arrays.asList("Manual Testing", "JIRA", "Attention to Detail"), 2.8, false, "Ensure the quality of our upcoming game releases."),
                    createListing("Site Reliability Engineer", "Datadog", "New York, NY", WorkMode.HYBRID, EmploymentType.FULL_TIME, Arrays.asList("Linux", "Go", "Observability"), 3.0, true, "Keep our critical systems running smoothly."),
                    createListing("Marketing Intern", "Spotify", "New York, NY", WorkMode.HYBRID, EmploymentType.INTERNSHIP_STIPEND, Arrays.asList("Social Media", "Content Creation", "Analytics"), 3.0, false, "Help execute global marketing campaigns."),
                    createListing("Blockchain Developer", "Coinbase", "Remote", WorkMode.REMOTE, EmploymentType.FULL_TIME, Arrays.asList("Solidity", "Smart Contracts", "Cryptography"), 3.0, true, "Build the future of decentralized finance."),
                    createListing("Hardware Engineer Intern", "NVIDIA", "Santa Clara, CA", WorkMode.ONSITE, EmploymentType.INTERNSHIP_STIPEND, Arrays.asList("Verilog", "VHDL", "Computer Architecture"), 3.6, true, "Design the next generation of GPUs.")
            );

            listingRepository.saveAll(listings);
            System.out.println("Seeded " + listings.size() + " listings.");
        }
    }

    private Listing createListing(String title, String company, String location, WorkMode workMode, EmploymentType employmentType, List<String> requiredSkills, Double gpaThreshold, Boolean sponsorshipAvailable, String summary) {
        return Listing.builder()
                .title(title)
                .company(company)
                .location(location)
                .workMode(workMode)
                .employmentType(employmentType)
                .requiredSkills(requiredSkills)
                .gpaThreshold(gpaThreshold)
                .sponsorshipAvailable(sponsorshipAvailable)
                .summary(summary)
                .build();
    }
}
