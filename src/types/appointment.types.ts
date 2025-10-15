export interface Appointment {
  id: string;
  title: string;
  description?: string;
  status: "upcoming" | "expired" | "canceled" | "completed";
  location?: string;
  appointmentWith: "court" | "client" | "both";
  caseId: string;
  userId: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    fullName: string;
    caseNumber: string;
    phoneNumber: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface CreateAppointmentInput {
  title: string;
  description?: string;
  status?: "upcoming" | "expired" | "canceled" | "completed";
  location?: string;
  appointmentWith: "court" | "client" | "both";
  caseId: string;
  userId: string;
  date: string;
}

export interface UpdateAppointmentInput {
  title?: string;
  description?: string;
  status?: "upcoming" | "expired" | "canceled" | "completed";
  location?: string;
  appointmentWith?: "court" | "client" | "both";
  caseId?: string;
  userId?: string;
  date?: string;
}

export interface AppointmentFilters {
  startDate?: string;
  endDate?: string;
  status?: string;
  appointmentWith?: string;
  caseId?: string;
  userId?: string;
}
