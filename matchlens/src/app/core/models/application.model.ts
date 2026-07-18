export type ApplicationStatus = 'SAVED' | 'APPLIED' | 'IN_REVIEW';

export interface Application {
  id?: string;
  studentId: string;
  listingId: string;
  status: ApplicationStatus;
  updatedAt: string;
}
