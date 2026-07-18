export type ApplicationStatus = 'saved' | 'applied' | 'in_review';

export interface Application {
  id?: string;
  studentId: string;
  listingId: string;
  status: ApplicationStatus;
  updatedAt: string;
}
