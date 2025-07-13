export type UserRole = 'client' | 'advocate' | 'intern' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Advocate extends User {
  specializations: string[];
  location: string;
  pricePerHour: number;
  rating: number;
  totalCases: number;
  currentCases: number;
}

export interface Client extends User {
  totalAppointments: number;
  activeCases: number;
}

export interface Intern extends User {
  education: string;
  skills: string[];
  appliedInternships: number;
}

export interface Case {
  id: string;
  title: string;
  description: string;
  category: string;
  clientId: string;
  advocateId?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Internship {
  id: string;
  title: string;
  advocateId: string;
  description: string;
  location: string;
  stipend: number;
  duration: string;
  requirements: string[];
  status: 'open' | 'closed';
  applications: InternshipApplication[];
  createdAt: string;
  updatedAt: string;
}

export interface InternshipApplication {
  id: string;
  internId: string;
  internshipId: string;
  status: 'pending' | 'accepted' | 'rejected';
  resume: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  advocateId: string;
  caseId?: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  read: boolean;
}
