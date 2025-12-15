import { create } from "zustand";
import type {
  Application,
  Job,
  Profile,
  ResumeUploadPayload,
} from "@/types";
import { getStorage } from "@/lib/demoStorage";

export interface Filters {
  query: string;
  experience: string;
  mode: string;
  type: string;
  skills: string[];
}

export interface SubmitApplicationPayload {
  jobId: string;
  fullName: string;
  email: string;
  message: string;
  resume: ResumeUploadPayload;
  profileId?: string;
  skills?: string[];
}

export interface ProfilePayload {
  id?: string;
  name: string;
  email: string;
  headline: string;
  skills?: string[];
  bio?: string;
  resume?: ResumeUploadPayload;
  links?: string[];
  role?: Profile["role"];
  companyName?: string;
  companyWebsite?: string;
  companySize?: string;
  industry?: string;
  companyDescription?: string;
}

export interface JobPayload
  extends Omit<Job, "id" | "createdAt" | "skills" | "mode"> {
  skills: string[];
  mode?: Job["mode"];
}

interface PortalState {
  jobs: Job[];
  applications: Application[];
  profile?: Profile;
  filters: Filters;
  loading: boolean;
  error?: string;
  hydrateJobs: (jobs: Job[]) => void;
  setFilters: (filters: Partial<Filters>) => void;
  fetchJobs: () => Promise<void>;
  fetchApplications: (jobId?: string) => Promise<void>;
  submitApplication: (payload: SubmitApplicationPayload) => Promise<Application>;
  loadProfile: () => Promise<void>;
  saveProfile: (payload: ProfilePayload) => Promise<Profile>;
  createJob: (payload: JobPayload) => Promise<Job>;
  setError: (message?: string) => void;
  updateApplicationStatus: (
    id: string,
    status: Application["status"],
  ) => Promise<Application>;
  enableChat: (id: string) => Promise<Application>;
}

export const usePortalStore = create<PortalState>((set) => ({
  jobs: [],
  applications: [],
  filters: {
    query: "",
    experience: "any",
    mode: "any",
    type: "any",
    skills: [],
  },
  loading: false,
  error: undefined,
  hydrateJobs: (jobs) => set({ jobs }),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  setError: (message) => set({ error: message }),
  fetchJobs: async () => {
    set({ loading: true, error: undefined });
    try {
      const response = await fetch("/api/jobs");
      if (!response.ok) throw new Error("Unable to load jobs");
      const data = await response.json();
      set({ jobs: data.jobs });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      set({ error: message });
    } finally {
      set({ loading: false });
    }
  },
  fetchApplications: async (jobId?: string) => {
    set({ loading: true, error: undefined });
    try {
      const query = jobId ? `?jobId=${jobId}` : "";
      const response = await fetch(`/api/applications${query}`);
      if (!response.ok) throw new Error("Unable to load applications");
      const data = await response.json();
      set({ applications: data.applications });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      set({ error: message });
    } finally {
      set({ loading: false });
    }
  },
  loadProfile: async () => {
    set({ loading: true, error: undefined });
    try {
      // Get current user email from storage
      const userEmail = getStorage().getItem("userEmail");
      if (!userEmail) {
        set({ profile: undefined });
        return;
      }
      
      const response = await fetch(`/api/profile?email=${encodeURIComponent(userEmail)}`);
      if (!response.ok) throw new Error("Unable to load profile");
      const data = await response.json();
      set({ profile: data.profile });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      set({ error: message });
    } finally {
      set({ loading: false });
    }
  },
  submitApplication: async (payload) => {
    set({ loading: true, error: undefined });
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message ?? "Unable to submit application");
      }
      set((state) => ({
        applications: [data.application, ...state.applications],
      }));
      return data.application as Application;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      set({ error: message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  saveProfile: async (payload) => {
    set({ loading: true, error: undefined });
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message ?? "Unable to save profile");
      }
      set({ profile: data.profile });
      return data.profile as Profile;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      set({ error: message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  createJob: async (payload) => {
    set({ loading: true, error: undefined });
    try {
      const userEmail = getStorage().getItem("userEmail");
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          employerEmail: userEmail,
          status: "open",
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message ?? "Unable to post job");
      }
      set((state) => ({ jobs: [data.job, ...state.jobs] }));
      return data.job as Job;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      set({ error: message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  updateApplicationStatus: async (id, status) => {
    set({ loading: true, error: undefined });
    try {
      const response = await fetch("/api/applications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message ?? "Unable to update application");
      }
      set((state) => ({
        applications: state.applications.map((application) =>
          application.id === id ? data.application : application,
        ),
      }));
      return data.application as Application;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      set({ error: message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  enableChat: async (id) => {
    set({ loading: true, error: undefined });
    try {
      const response = await fetch("/api/applications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, chatEnabled: true }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message ?? "Unable to enable chat");
      }
      set((state) => ({
        applications: state.applications.map((application) =>
          application.id === id ? data.application : application,
        ),
      }));
      return data.application as Application;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      set({ error: message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
