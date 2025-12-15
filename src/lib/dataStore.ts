import fs from "node:fs/promises";
import path from "node:path";
import { v4 as uuidv4 } from "uuid";
import type {
  Application,
  Database,
  Job,
  Profile,
  ResumeUploadPayload,
} from "@/types";
import { getMemoryDb, setMemoryDb } from "./memoryStore";

const DB_PATH = path.join(process.cwd(), "src", "data", "db.json");
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// Check if we can write to filesystem (true in dev, false on Vercel)
let canWriteFiles = true;

async function checkFileSystemAccess(): Promise<boolean> {
  try {
    const testPath = path.join(process.cwd(), ".write-test");
    await fs.writeFile(testPath, "test", "utf-8");
    await fs.unlink(testPath);
    return true;
  } catch {
    return false;
  }
}

// Initialize on first import
checkFileSystemAccess().then((result) => {
  canWriteFiles = result;
  if (!canWriteFiles) {
    console.log("📦 Using in-memory storage (serverless environment detected)");
  }
});

export async function readDb(): Promise<Database> {
  if (!canWriteFiles) {
    // Use in-memory storage on serverless
    return getMemoryDb();
  }

  // Use file storage in dev
  try {
    const raw = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(raw) as Database;
  } catch {
    // File doesn't exist, return from memory
    return getMemoryDb();
  }
}

export async function writeDb(db: Database): Promise<void> {
  if (!canWriteFiles) {
    // Save to memory on serverless
    setMemoryDb(db);
    return;
  }

  // Save to file in dev
  try {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
  } catch {
    // Fallback to memory if file write fails
    setMemoryDb(db);
  }
}

export async function listJobs(): Promise<Job[]> {
  const db = await readDb();
  return db.jobs.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function createJob(
  payload: Omit<Job, "id" | "createdAt"> & { id?: string; createdAt?: string },
): Promise<Job> {
  const db = await readDb();
  const job: Job = {
    id: payload.id ?? `job-${uuidv4()}`,
    createdAt: payload.createdAt ?? new Date().toISOString(),
    ...payload,
  };
  db.jobs = [job, ...db.jobs];
  await writeDb(db);
  return job;
}

export async function upsertProfile(
  payload: Omit<Profile, "id"> & { id?: string },
): Promise<Profile> {
  const db = await readDb();
  const existingIndex = payload.id
    ? db.profiles.findIndex((p) => p.id === payload.id)
    : -1;
  const profile: Profile = {
    id: payload.id ?? `profile-${uuidv4()}`,
    ...payload,
  };
  if (existingIndex >= 0) {
    db.profiles[existingIndex] = profile;
  } else {
    db.profiles = [profile, ...db.profiles];
  }
  await writeDb(db);
  return profile;
}

export async function listProfiles(): Promise<Profile[]> {
  const db = await readDb();
  return db.profiles;
}

export async function addApplication(
  payload: Omit<Application, "id" | "createdAt" | "status"> & {
    status?: Application["status"];
  },
): Promise<Application> {
  const db = await readDb();
  
  // Get job details to add to application
  const job = db.jobs.find((j) => j.id === payload.jobId);
  
  const application: Application = {
    id: `app-${uuidv4()}`,
    createdAt: new Date().toISOString(),
    status: payload.status ?? "submitted",
    jobTitle: job?.title,
    company: job?.company,
    chatEnabled: false,
    ...payload,
  };
  db.applications = [application, ...db.applications];
  await writeDb(db);
  return application;
}

export async function listApplications(jobId?: string): Promise<Application[]> {
  const db = await readDb();
  return jobId
    ? db.applications.filter((app) => app.jobId === jobId)
    : db.applications;
}

export async function updateApplicationStatus(
  id: string,
  status: Application["status"],
): Promise<Application> {
  const db = await readDb();
  const index = db.applications.findIndex((app) => app.id === id);
  if (index === -1) {
    throw new Error("Application not found");
  }
  db.applications[index].status = status;
  
  // Automatically enable chat when status is accepted
  if (status === "accepted") {
    db.applications[index].chatEnabled = true;
  }
  
  await writeDb(db);
  return db.applications[index];
}

export async function enableChatForApplication(
  id: string,
  enabled: boolean,
): Promise<Application> {
  const db = await readDb();
  const index = db.applications.findIndex((app) => app.id === id);
  if (index === -1) {
    throw new Error("Application not found");
  }
  db.applications[index].chatEnabled = enabled;
  await writeDb(db);
  return db.applications[index];
}

export async function saveResumeFile(
  file: ResumeUploadPayload,
): Promise<string> {
  if (!canWriteFiles) {
    // On serverless, return a data URL that includes the file content
    // This allows the resume to be "stored" in the database as a data URL
    const base64Payload = file.base64.includes(",") 
      ? file.base64 
      : `data:application/pdf;base64,${file.base64}`;
    
    console.log("📦 Resume stored as data URL (serverless mode)");
    return base64Payload;
  }

  // Local file storage for development
  const sanitizedName = path.basename(file.fileName).replaceAll(/\s+/g, "-");
  const targetName = `${Date.now()}-${sanitizedName}`;
  const uploadPath = path.join(UPLOAD_DIR, targetName);

  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const base64Payload = file.base64.split(",").pop() ?? file.base64;
    const buffer = Buffer.from(base64Payload, "base64");
    await fs.writeFile(uploadPath, buffer);
    return `/uploads/${targetName}`;
  } catch {
    // Fallback to data URL if file write fails
    const base64Payload = file.base64.includes(",") 
      ? file.base64 
      : `data:application/pdf;base64,${file.base64}`;
    return base64Payload;
  }
}

export async function getProfile(id: string): Promise<Profile | null> {
  const db = await readDb();
  return db.profiles.find((p) => p.id === id) ?? null;
}

export async function saveProfile(
  payload: Omit<Profile, "id"> & { id?: string },
): Promise<Profile> {
  return upsertProfile(payload);
}
