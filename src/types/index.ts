export type Mode = "Remote" | "Hybrid" | "On-site";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  experience: string;
  skills: string[];
  salary?: string;
  description: string;
  createdAt: string;
  mode?: Mode;
  employerId?: string;
  employerEmail?: string;
  views?: number;
  applicationsCount?: number;
  status?: "open" | "closed";
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  headline: string;
  role?: "jobseeker" | "employer";
  createdAt?: string;
  // Jobseeker fields
  skills?: string[];
  bio?: string;
  resumeUrl?: string;
  links?: string[];
  // Employer fields
  companyName?: string;
  companyWebsite?: string;
  companySize?: string;
  industry?: string;
  companyDescription?: string;
}

export interface Application {
  id: string;
  jobId: string;
  profileId?: string;
  fullName: string;
  email: string;
  skills?: string[];
  message: string;
  resumeUrl: string;
  createdAt: string;
  status: "submitted" | "reviewing" | "shortlisted" | "rejected" | "accepted";
  chatEnabled?: boolean;
  jobTitle?: string;
  company?: string;
  jobType?: string;
  jobMode?: string;
  jobLocation?: string;
}

export interface Message {
  id: string;
  applicationId: string;
  sender: "employer" | "candidate";
  senderEmail: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface VideoCall {
  id: string;
  applicationId: string;
  initiatorEmail: string;
  initiatorRole: "employer" | "candidate";
  status: "calling" | "active" | "ended";
  startedAt: string;
  endedAt?: string;
  roomUrl?: string; // Daily.co room URL
}

export interface Database {
  jobs: Job[];
  profiles: Profile[];
  applications: Application[];
  messages: Message[];
  videoCalls: VideoCall[];
}

export interface ResumeUploadPayload {
  fileName: string;
  base64: string;
}
