export interface Arbitrator {
  id: string;
  fullName: string;
  profilePicture: string | null;
  location: string;
  languages: string[];
  specializationAreas: string[];
  yearsOfExperience: number;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateArbitratorDto {
  fullName: string;
  profilePicture?: string | null;
  location: string;
  yearsOfExperience: number;
  languages: string[];
  specializationAreas: string[];
  description: string;
}

export interface UpdateArbitratorDto {
  fullName?: string | null;
  profilePicture?: string | null;
  location?: string | null;
  yearsOfExperience?: number | null;
  languages?: string[] | null;
  specializationAreas?: string[] | null;
  description?: string | null;
  isActive?: boolean | null;
}

export interface ArbitrationRequest {
  id: string;
  fullName: string;
  phoneNumber: string;
  emailAddress: string | null;
  location: string | null;
  preferredLanguages: string[] | null;
  typeOfDispute: string;
  disputeSummary: string;
  preferredArbitratorId: string | null;
  status: RequestStatus;
  adminNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
  preferredArbitrator: Arbitrator | null;
}

export interface CreateArbitrationRequestDto {
  fullName: string;
  phoneNumber: string;
  emailAddress?: string | null;
  location?: string | null;
  preferredLanguages?: string[] | null;
  typeOfDispute: string;
  disputeSummary: string;
  preferredArbitratorId?: string | null;
}

export interface UpdateArbitrationRequestDto {
  status?: RequestStatus | null;
  adminNotes?: string | null;
  preferredArbitratorId?: string | null;
}

export enum RequestStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface ArbitrationStats {
  totalArbitrators: number;
  activeArbitrators: number;
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  requestsByStatus: Record<RequestStatus, number>;
} 