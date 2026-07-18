import { MatchedListing } from '../models/listing.model';
import { Application } from '../models/application.model';

export const MOCK_LISTINGS: MatchedListing[] = [
  {
    listingId: 'lst-001',
    title: 'Software Engineering Intern',
    company: 'Google',
    location: 'Mountain View, CA',
    workMode: 'HYBRID',
    employmentType: 'internship_stipend',
    summary: 'Join Google\'s Core Infrastructure team to work on distributed systems at massive scale. You\'ll contribute to real production code used by billions of people.',
    score: 94,
    requiredSkills: ['Java', 'Python', 'Distributed Systems', 'Data Structures'],
    minGpa: 3.0,
    sponsorshipAvailable: true,
    breakdown: { skillMatch: 95, gpaMet: true, authCompatible: true, matchedSkills: ['Java', 'Python', 'Data Structures'] }
  },
  {
    listingId: 'lst-002',
    title: 'Machine Learning Engineer Intern',
    company: 'OpenAI',
    location: 'San Francisco, CA',
    workMode: 'ONSITE',
    employmentType: 'internship_stipend',
    summary: 'Work alongside researchers pushing the frontier of AI. Build training pipelines, evaluate model capabilities, and ship features used in ChatGPT and API products.',
    score: 91,
    requiredSkills: ['Python', 'PyTorch', 'Machine Learning', 'Linear Algebra'],
    minGpa: 3.5,
    sponsorshipAvailable: true,
    breakdown: { skillMatch: 92, gpaMet: true, authCompatible: true, matchedSkills: ['Python', 'PyTorch', 'Machine Learning'] }
  },
  {
    listingId: 'lst-003',
    title: 'Full Stack Engineer Intern',
    company: 'Stripe',
    location: 'Seattle, WA',
    workMode: 'HYBRID',
    employmentType: 'internship_stipend',
    summary: 'Build the financial infrastructure of the internet. You\'ll work on Stripe\'s dashboard, API, or internal tools used by millions of businesses worldwide.',
    score: 88,
    requiredSkills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
    minGpa: 3.2,
    sponsorshipAvailable: true,
    breakdown: { skillMatch: 90, gpaMet: true, authCompatible: true, matchedSkills: ['TypeScript', 'React', 'Node.js'] }
  },
  {
    listingId: 'lst-004',
    title: 'Backend Engineer Intern',
    company: 'Airbnb',
    location: 'San Francisco, CA',
    workMode: 'HYBRID',
    employmentType: 'internship_stipend',
    summary: 'Help design and build the backend services that power global travel for over 150 million guests. Work with high-throughput APIs and real-time data systems.',
    score: 85,
    requiredSkills: ['Java', 'Ruby', 'Microservices', 'SQL', 'Redis'],
    minGpa: 3.0,
    sponsorshipAvailable: true,
    breakdown: { skillMatch: 86, gpaMet: true, authCompatible: true, matchedSkills: ['Java', 'SQL', 'Redis'] }
  },
  {
    listingId: 'lst-005',
    title: 'Data Engineering Intern',
    company: 'Databricks',
    location: 'Remote',
    workMode: 'REMOTE',
    employmentType: 'internship_stipend',
    summary: 'Build and optimize data pipelines on the Databricks Lakehouse platform. Work with Apache Spark, Delta Lake, and PySpark at petabyte scale.',
    score: 82,
    requiredSkills: ['Python', 'Apache Spark', 'SQL', 'Scala'],
    minGpa: 3.0,
    sponsorshipAvailable: false,
    breakdown: { skillMatch: 83, gpaMet: true, authCompatible: true, matchedSkills: ['Python', 'SQL'] }
  },
  {
    listingId: 'lst-006',
    title: 'Product Security Intern',
    company: 'Cloudflare',
    location: 'Austin, TX',
    workMode: 'HYBRID',
    employmentType: 'internship_stipend',
    summary: 'Protect the Internet at scale. Work with Cloudflare\'s security team on threat analysis, vulnerability research, and zero-trust security products.',
    score: 78,
    requiredSkills: ['Python', 'Networking', 'Linux', 'Cryptography'],
    minGpa: 3.0,
    sponsorshipAvailable: true,
    breakdown: { skillMatch: 78, gpaMet: true, authCompatible: true, matchedSkills: ['Python', 'Linux'] }
  },
  {
    listingId: 'lst-007',
    title: 'iOS Engineer Intern',
    company: 'Lyft',
    location: 'San Francisco, CA',
    workMode: 'ONSITE',
    employmentType: 'internship_stipend',
    summary: 'Build the Lyft iOS app used by millions of riders daily. You\'ll own features end-to-end, from design review to App Store release.',
    score: 75,
    requiredSkills: ['Swift', 'SwiftUI', 'iOS SDK', 'Objective-C'],
    minGpa: 3.0,
    sponsorshipAvailable: false,
    breakdown: { skillMatch: 75, gpaMet: true, authCompatible: true, matchedSkills: ['Swift', 'iOS SDK'] }
  },
  {
    listingId: 'lst-008',
    title: 'Cloud Infrastructure Intern',
    company: 'Snowflake',
    location: 'Bozeman, MT',
    workMode: 'HYBRID',
    employmentType: 'internship_stipend',
    summary: 'Work on the core infrastructure that makes Snowflake\'s Data Cloud possible — including storage, compute, and networking layers used by thousands of enterprise customers.',
    score: 72,
    requiredSkills: ['Go', 'Kubernetes', 'AWS', 'C++', 'Docker'],
    minGpa: 3.3,
    sponsorshipAvailable: true,
    breakdown: { skillMatch: 70, gpaMet: true, authCompatible: true, matchedSkills: ['Docker', 'AWS'] }
  },
  {
    listingId: 'lst-009',
    title: 'Site Reliability Engineer Intern',
    company: 'LinkedIn',
    location: 'Sunnyvale, CA',
    workMode: 'HYBRID',
    employmentType: 'internship_stipend',
    summary: 'Ensure LinkedIn\'s platform is available for 950 million members. Work on observability, incident response tooling, and large-scale deployment automation.',
    score: 70,
    requiredSkills: ['Python', 'Terraform', 'Linux', 'Prometheus', 'Grafana'],
    minGpa: 3.0,
    sponsorshipAvailable: true,
    breakdown: { skillMatch: 72, gpaMet: true, authCompatible: true, matchedSkills: ['Python', 'Linux'] }
  },
  {
    listingId: 'lst-010',
    title: 'Android Engineer Intern',
    company: 'Spotify',
    location: 'New York, NY',
    workMode: 'HYBRID',
    employmentType: 'internship_stipend',
    summary: 'Build features for the Spotify Android app used by 600 million listeners. Work on the home feed, podcast player, and offline sync functionality.',
    score: 66,
    requiredSkills: ['Kotlin', 'Android SDK', 'Jetpack Compose', 'Java'],
    minGpa: 3.0,
    sponsorshipAvailable: true,
    breakdown: { skillMatch: 65, gpaMet: true, authCompatible: true, matchedSkills: ['Java'] }
  },
  {
    listingId: 'lst-011',
    title: 'Quantitative Research Intern',
    company: 'Jane Street',
    location: 'New York, NY',
    workMode: 'ONSITE',
    employmentType: 'internship_stipend',
    summary: 'Apply mathematical and computational thinking to trading problems. Work on statistical models, pricing algorithms, and real-time trading systems.',
    score: 63,
    requiredSkills: ['OCaml', 'Statistics', 'Probability', 'Python', 'Linear Algebra'],
    minGpa: 3.7,
    sponsorshipAvailable: false,
    breakdown: { skillMatch: 60, gpaMet: false, authCompatible: true, matchedSkills: ['Python', 'Statistics'] }
  },
  {
    listingId: 'lst-012',
    title: 'Frontend Engineer Intern',
    company: 'Figma',
    location: 'Remote',
    workMode: 'REMOTE',
    employmentType: 'internship_stipend',
    summary: 'Build the design tools used by 8 million designers and developers. Work on the Figma editor canvas, plugin APIs, or design system components.',
    score: 61,
    requiredSkills: ['TypeScript', 'React', 'CSS', 'WebGL', 'Canvas API'],
    minGpa: 3.0,
    sponsorshipAvailable: true,
    breakdown: { skillMatch: 62, gpaMet: true, authCompatible: true, matchedSkills: ['TypeScript', 'React'] }
  },
  {
    listingId: 'lst-013',
    title: 'Compiler Engineer Intern',
    company: 'Apple',
    location: 'Cupertino, CA',
    workMode: 'ONSITE',
    employmentType: 'internship_stipend',
    summary: 'Work on the LLVM compiler toolchain powering Swift, Objective-C, and system languages across all Apple platforms including iOS, macOS, and embedded systems.',
    score: 55,
    requiredSkills: ['C++', 'LLVM', 'Assembly', 'Compiler Design', 'OCaml'],
    minGpa: 3.5,
    sponsorshipAvailable: false,
    breakdown: { skillMatch: 50, gpaMet: false, authCompatible: true, matchedSkills: ['C++'] }
  },
  {
    listingId: 'lst-014',
    title: 'Research Scientist Intern',
    company: 'DeepMind',
    location: 'London, UK',
    workMode: 'ONSITE',
    employmentType: 'internship_stipend',
    summary: 'Conduct cutting-edge research in reinforcement learning, game theory, and AI safety. Opportunity to co-author papers at top ML conferences.',
    score: 48,
    requiredSkills: ['Python', 'TensorFlow', 'Reinforcement Learning', 'Research Writing', 'JAX'],
    minGpa: 3.8,
    sponsorshipAvailable: false,
    breakdown: { skillMatch: 44, gpaMet: false, authCompatible: false, matchedSkills: ['Python', 'TensorFlow'] }
  },
  {
    listingId: 'lst-015',
    title: 'Embedded Systems Intern',
    company: 'Tesla',
    location: 'Palo Alto, CA',
    workMode: 'ONSITE',
    employmentType: 'internship_stipend',
    summary: 'Write firmware for Tesla\'s battery management, thermal control, and autopilot hardware systems. Close to the metal, high-impact engineering.',
    score: 44,
    requiredSkills: ['C', 'C++', 'RTOS', 'CAN Bus', 'Embedded Linux'],
    minGpa: 3.2,
    sponsorshipAvailable: true,
    breakdown: { skillMatch: 40, gpaMet: true, authCompatible: true, matchedSkills: ['C', 'C++'] }
  },
  {
    listingId: 'lst-016',
    title: 'Blockchain Engineer Intern',
    company: 'Coinbase',
    location: 'Remote',
    workMode: 'REMOTE',
    employmentType: 'internship_stipend',
    summary: 'Help build the financial system of the future. Work on smart contracts, on-chain analytics, or the Coinbase Wallet and Exchange core infrastructure.',
    score: 41,
    requiredSkills: ['Solidity', 'Go', 'Rust', 'Cryptography', 'Ethereum'],
    minGpa: 3.0,
    sponsorshipAvailable: false,
    breakdown: { skillMatch: 38, gpaMet: true, authCompatible: true, matchedSkills: [] }
  },
  {
    listingId: 'lst-017',
    title: 'Systems Programming Intern',
    company: 'Cloudflare',
    location: 'Remote',
    workMode: 'REMOTE',
    employmentType: 'internship_stipend',
    summary: 'Build low-level network proxies and edge runtime components in Rust. Work on the technology behind Workers, CDN, and Zero Trust products.',
    score: 38,
    requiredSkills: ['Rust', 'C', 'Networking', 'WASM', 'Linux Kernel'],
    minGpa: 3.0,
    sponsorshipAvailable: true,
    breakdown: { skillMatch: 35, gpaMet: true, authCompatible: true, matchedSkills: ['C', 'Networking'] }
  }
];

export const MOCK_APPLICATIONS: { application: { id: string; studentId: string; listingId: string; status: 'SAVED' | 'APPLIED' | 'IN_REVIEW'; updatedAt: string }; listing: MatchedListing }[] = [
  {
    application: { id: 'app-001', studentId: 'demo-student', listingId: 'lst-001', status: 'IN_REVIEW', updatedAt: '2026-07-15T10:30:00Z' },
    listing: MOCK_LISTINGS[0]   // Google SWE Intern
  },
  {
    application: { id: 'app-002', studentId: 'demo-student', listingId: 'lst-002', status: 'APPLIED', updatedAt: '2026-07-14T08:00:00Z' },
    listing: MOCK_LISTINGS[1]   // OpenAI ML Intern
  },
  {
    application: { id: 'app-003', studentId: 'demo-student', listingId: 'lst-003', status: 'APPLIED', updatedAt: '2026-07-13T15:45:00Z' },
    listing: MOCK_LISTINGS[2]   // Stripe Full Stack Intern
  },
  {
    application: { id: 'app-004', studentId: 'demo-student', listingId: 'lst-005', status: 'SAVED', updatedAt: '2026-07-16T12:00:00Z' },
    listing: MOCK_LISTINGS[4]   // Databricks Data Engineering Intern
  },
  {
    application: { id: 'app-005', studentId: 'demo-student', listingId: 'lst-006', status: 'SAVED', updatedAt: '2026-07-17T09:20:00Z' },
    listing: MOCK_LISTINGS[5]   // Cloudflare Security Intern
  },
  {
    application: { id: 'app-006', studentId: 'demo-student', listingId: 'lst-012', status: 'IN_REVIEW', updatedAt: '2026-07-12T14:10:00Z' },
    listing: MOCK_LISTINGS[11]  // Figma Frontend Intern
  }
];
