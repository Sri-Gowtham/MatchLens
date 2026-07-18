export interface Student {
  id: string;
  name: string;
  email: string;
  skills: string[];
  gpa: number;
  workAuthStatus: WorkAuthStatus;
  resumeLink: string;
}

export type WorkAuthStatus =
  | 'us_citizen'
  | 'green_card'
  | 'opt_cpt'
  | 'h1b_required';

export const WORK_AUTH_LABELS: Record<WorkAuthStatus, string> = {
  us_citizen: 'US Citizen / Permanent Resident',
  green_card: 'Green Card Holder',
  opt_cpt: 'OPT / CPT (No Sponsorship Needed)',
  h1b_required: 'H1B Sponsorship Required'
};
