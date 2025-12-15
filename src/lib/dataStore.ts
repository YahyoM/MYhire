import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import type {
  Application,
  Database,
  Job,
  Profile,
  ResumeUploadPayload,
} from "@/types";
import seed from "@/data/db.json";

const DB_PATH = path.join(process.cwd(), "src", "data", "db.json");
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

async function ensureDb(): Promise<void> {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(seed, null, 2), "utf-8");
  }
}

export async function readDb(): Promise<Database> {
  await ensureDb();
  const raw = await fs.readFile(DB_PATH, "utf-8");
  return JSON.parse(raw) as Database;
}

export async function writeDb(db: Database): Promise<void> {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
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
  const sanitizedName = path.basename(file.fileName).replace(/\s+/g, "-");
  const targetName = `${Date.now()}-${sanitizedName}`;
  const uploadPath = path.join(UPLOAD_DIR, targetName);

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const base64Payload = file.base64.split(",").pop() ?? file.base64;
  const buffer = Buffer.from(base64Payload, "base64");
  await fs.writeFile(uploadPath, buffer);

  return `/uploads/${targetName}`;
}
