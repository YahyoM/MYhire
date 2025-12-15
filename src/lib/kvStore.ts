// Vercel KV wrapper with fallback to local JSON
import type {
  Application,
  Database,
  Job,
  Message,
  Profile,
  ResumeUploadPayload,
  VideoCall,
} from "@/types";
import { uploadResume } from "./blobStorage";

interface KVClient {
  get: <T>(key: string) => Promise<T | null>;
  set: (key: string, value: unknown) => Promise<void>;
  exists: (...keys: string[]) => Promise<number>;
}

let kv: KVClient | null = null;
let kvInitialized = false;

// Try to import Vercel KV
async function initKV() {
  if (kvInitialized) return;
  kvInitialized = true;
  
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const vercelKV = await import("@vercel/kv");
      kv = vercelKV.createClient({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      }) as KVClient;
      console.log("✅ Vercel KV connected - data will persist across users");
    } else {
      console.warn("⚠️ No KV configured - using local storage");
      console.warn("   For multi-user sync on Vercel, add Vercel KV in dashboard");
    }
  } catch (error) {
    console.error("Failed to initialize KV:", error);
  }
}

// Initialize on first import
void initKV();

// Import local dataStore functions
import {
  readDb as readLocalDb,
  writeDb as writeLocalDb,
  listJobs as listLocalJobs,
  createJob as createLocalJob,
  listApplications as listLocalApplications,
  addApplication as addLocalApplication,
  updateApplicationStatus as updateLocalApplicationStatus,
  enableChatForApplication as enableLocalChatForApplication,
  getProfile as getLocalProfile,
  saveProfile as saveLocalProfile,
} from "./dataStore";

// KV Keys
const JOBS_KEY = "myhire:jobs";
const APPLICATIONS_KEY = "myhire:applications";
const PROFILES_KEY = "myhire:profiles";
const MESSAGES_KEY = "myhire:messages";
const VIDEOCALLS_KEY = "myhire:videoCalls";
const DB_KEY = "myhire:db";

// Initialize KV with seed data if empty
async function initializeKV() {
  if (!kv) return;
  
  try {
    const exists = await kv.exists(DB_KEY);
    if (!exists) {
      const seed = await readLocalDb();
      await kv.set(JOBS_KEY, seed.jobs);
      await kv.set(APPLICATIONS_KEY, seed.applications);
      await kv.set(PROFILES_KEY, seed.profiles || []);
      await kv.set(MESSAGES_KEY, seed.messages || []);
      await kv.set(VIDEOCALLS_KEY, seed.videoCalls || []);
      await kv.set(DB_KEY, { initialized: true, timestamp: new Date().toISOString() });
    }
  } catch (error) {
    console.error("Failed to initialize KV:", error);
  }
}

// Read/Write operations with fallback
export async function readDb(): Promise<Database> {
  await initKV();
  
  if (kv) {
    try {
      await initializeKV();
      const [jobs, applications, profiles, messages, videoCalls] = await Promise.all([
        kv.get<Job[]>(JOBS_KEY),
        kv.get<Application[]>(APPLICATIONS_KEY),
        kv.get<Profile[]>(PROFILES_KEY),
        kv.get<Message[]>(MESSAGES_KEY),
        kv.get<VideoCall[]>(VIDEOCALLS_KEY),
      ]);
      
      return {
        jobs: jobs || [],
        applications: applications || [],
        profiles: profiles || [],
        messages: messages || [],
        videoCalls: videoCalls || [],
      };
    } catch (error) {
      console.error("KV read failed, falling back to local:", error);
    }
  }
  
  return readLocalDb();
}

export async function writeDb(db: Database): Promise<void> {
  await initKV();
  
  if (kv) {
    try {
      await Promise.all([
        kv.set(JOBS_KEY, db.jobs),
        kv.set(APPLICATIONS_KEY, db.applications),
        kv.set(PROFILES_KEY, db.profiles || []),
        kv.set(MESSAGES_KEY, db.messages || []),
        kv.set(VIDEOCALLS_KEY, db.videoCalls || []),
      ]);
      return;
    } catch (error) {
      console.error("KV write failed, falling back to local:", error);
    }
  }
  
  return writeLocalDb(db);
}

// Jobs
export async function listJobs(): Promise<Job[]> {
  await initKV();
  
  if (kv) {
    try {
      const jobs = await kv.get<Job[]>(JOBS_KEY);
      return (jobs || []).sort(
        (a: Job, b: Job) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error("KV listJobs failed:", error);
    }
  }
  return listLocalJobs();
}

export async function createJob(
  payload: Omit<Job, "id" | "createdAt"> & { id?: string; createdAt?: string }
): Promise<Job> {
  await initKV();
  
  if (kv) {
    try {
      const job = await createLocalJob(payload);
      const jobs = await kv.get<Job[]>(JOBS_KEY) || [];
      jobs.unshift(job); // Add to beginning for newest first
      await kv.set(JOBS_KEY, jobs);
      console.log(`✅ Job ${job.id} saved to KV - visible to all users`);
      return job;
    } catch (error) {
      console.error("KV createJob failed:", error);
    }
  }
  return createLocalJob(payload);
}

export async function updateJob(id: string, updates: Partial<Job>): Promise<Job> {
  await initKV();
  
  if (kv) {
    try {
      const jobs: Job[] = await kv.get<Job[]>(JOBS_KEY) || [];
      const index = jobs.findIndex((j) => j.id === id);
      if (index === -1) throw new Error("Job not found");
      
      const updated = { ...jobs[index], ...updates };
      jobs[index] = updated;
      await kv.set(JOBS_KEY, jobs);
      return updated;
    } catch (error) {
      console.error("KV updateJob failed:", error);
    }
  }
  
  // Fallback: update via readDb/writeDb
  const db = await readLocalDb();
  const jobIndex = db.jobs.findIndex((j) => j.id === id);
  if (jobIndex === -1) throw new Error("Job not found");
  
  const updatedJob = { ...db.jobs[jobIndex], ...updates };
  db.jobs[jobIndex] = updatedJob;
  await writeLocalDb(db);
  return updatedJob;
}

// Applications
export async function listApplications(jobId?: string): Promise<Application[]> {
  await initKV();
  
  if (kv) {
    try {
      const applications: Application[] = await kv.get<Application[]>(APPLICATIONS_KEY) || [];
      if (jobId) {
        return applications.filter((app) => app.jobId === jobId);
      }
      return applications;
    } catch (error) {
      console.error("KV listApplications failed:", error);
    }
  }
  return listLocalApplications(jobId);
}

export async function addApplication(
  payload: Omit<Application, "id" | "createdAt" | "status" | "chatEnabled">
): Promise<Application> {
  await initKV();
  
  if (kv) {
    try {
      const app = await addLocalApplication(payload);
      const applications = await kv.get<Application[]>(APPLICATIONS_KEY) || [];
      applications.unshift(app);
      await kv.set(APPLICATIONS_KEY, applications);
      console.log(`✅ Application ${app.id} saved to KV - employer will see it`);
      return app;
    } catch (error) {
      console.error("KV addApplication failed:", error);
    }
  }
  return addLocalApplication(payload);
}

export async function updateApplicationStatus(
  id: string,
  status: Application["status"]
): Promise<Application> {
  await initKV();
  
  if (kv) {
    try {
      const applications: Application[] = await kv.get<Application[]>(APPLICATIONS_KEY) || [];
      const index = applications.findIndex((app) => app.id === id);
      if (index === -1) throw new Error("Application not found");
      
      applications[index].status = status;
      // Auto-enable chat when accepted
      if (status === "accepted") {
        applications[index].chatEnabled = true;
      }
      await kv.set(APPLICATIONS_KEY, applications);
      return applications[index];
    } catch (error) {
      console.error("KV updateApplicationStatus failed:", error);
    }
  }
  return updateLocalApplicationStatus(id, status);
}

export async function enableChatForApplication(
  id: string,
  enabled: boolean
): Promise<Application> {
  await initKV();
  
  if (kv) {
    try {
      const applications: Application[] = await kv.get<Application[]>(APPLICATIONS_KEY) || [];
      const index = applications.findIndex((app) => app.id === id);
      if (index === -1) throw new Error("Application not found");
      
      applications[index].chatEnabled = enabled;
      await kv.set(APPLICATIONS_KEY, applications);
      return applications[index];
    } catch (error) {
      console.error("KV enableChatForApplication failed:", error);
    }
  }
  return enableLocalChatForApplication(id, enabled);
}

// Profiles
export async function listProfiles(): Promise<Profile[]> {
  await initKV();
  
  if (kv) {
    try {
      const profiles: Profile[] = await kv.get<Profile[]>(PROFILES_KEY) || [];
      return profiles;
    } catch (error) {
      console.error("KV listProfiles failed:", error);
    }
  }
  const db = await readLocalDb();
  return db.profiles;
}

export async function getProfile(email: string): Promise<Profile | null> {
  await initKV();
  
  if (kv) {
    try {
      const profiles: Profile[] = await kv.get<Profile[]>(PROFILES_KEY) || [];
      return profiles.find((p) => p.email === email) || null;
    } catch (error) {
      console.error("KV getProfile failed:", error);
    }
  }
  return getLocalProfile(email);
}

export async function saveProfile(profile: Profile): Promise<Profile> {
  await initKV();
  
  if (kv) {
    try {
      const profiles: Profile[] = await kv.get<Profile[]>(PROFILES_KEY) || [];
      const index = profiles.findIndex((p) => p.email === profile.email);
      
      if (index !== -1) {
        profiles[index] = profile;
      } else {
        profiles.push(profile);
      }
      
      await kv.set(PROFILES_KEY, profiles);
      return profile;
    } catch (error) {
      console.error("KV saveProfile failed:", error);
    }
  }
  return saveLocalProfile(profile);
}

// File upload using Vercel Blob with fallback
export async function saveResumeFile(
  payload: ResumeUploadPayload
): Promise<string> {
  return uploadResume(payload);
}
