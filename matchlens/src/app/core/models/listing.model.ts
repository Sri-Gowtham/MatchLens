export interface MatchBreakdown {
  skillMatch: number;       // 0–100 percent
  gpaMet: boolean;
  authCompatible: boolean;
  matchedSkills: string[];
}

export interface MatchedListing {
  listingId: string;
  title: string;
  company: string;
  location: string;
  workMode: WorkMode;
  score: number;            // 0–100 overall match score
  breakdown: MatchBreakdown;
  // Additional fields for simulator / filtering
  requiredSkills?: string[];
  minGpa?: number;
  sponsorshipAvailable?: boolean;
  role?: string;
  employmentType?: 'internship_stipend' | 'internship_unpaid' | 'full_time';
  summary?: string;
}

export type WorkMode = 'REMOTE' | 'ONSITE' | 'HYBRID';

export interface ListingFilters {
  role?: string;
  location?: string;
  workMode?: WorkMode | '';
  sponsorship?: boolean | null;
  employmentType?: 'internship_stipend' | 'internship_unpaid' | 'full_time' | '';
}
