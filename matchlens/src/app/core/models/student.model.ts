// ─── Work Authorization ───────────────────────────────────────────────────

export type WorkAuthStatus =
  | 'citizen'
  | 'needs_sponsorship'
  | 'no_sponsorship_needed';

export const WORK_AUTH_LABELS: Record<WorkAuthStatus, string> = {
  citizen: 'Citizen / Permanent Resident',
  no_sponsorship_needed: 'OPT / CPT / No Sponsorship Needed',
  needs_sponsorship: 'Requires H1B / Visa Sponsorship'
};

// ─── Sub-interfaces ───────────────────────────────────────────────────────

export interface DegreeEducation {
  institution: string;
  degreeName: string;
  branch: string;
  graduationMonth: string;  // e.g. "May"
  graduationYear: number;   // e.g. 2025
  cgpa: number;             // 0–10 scale (or 0–4, enforced by form)
}

export interface SchoolEducation {
  schoolName: string;
  percentage: number; // 0–100
}

export interface StudentEducation {
  degree: DegreeEducation;
  hsc: SchoolEducation;
  ssc: SchoolEducation;
}

export interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  startDate: string;          // "YYYY-MM" format
  endDate: string | null;     // "YYYY-MM" format or null
  current: boolean;
}

export interface StudentLinks {
  resumeUrl: string | null;
  linkedin: string;
  github: string;
  others: Array<{ label: string; url: string }>;
}

// ─── Main Student interface ───────────────────────────────────────────────

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  about: string;             // max 150 words
  workAuthStatus: WorkAuthStatus;
  skills: string[];
  education: StudentEducation;
  experience: ExperienceEntry[];
  links: StudentLinks;
}

// ─── Backward-compat accessor: derive a normalised GPA for the simulator ──
// The simulator uses a 0–4 scale; degree CGPA may be 0–10 (Indian scale).
// We normalise: if cgpa <= 4 treat as 4-scale; else divide by 10 * 4.
export function normalisedGpa(student: Student): number {
  const cgpa = student?.education?.degree?.cgpa ?? 0;
  return cgpa <= 4 ? cgpa : (cgpa / 10) * 4;
}
