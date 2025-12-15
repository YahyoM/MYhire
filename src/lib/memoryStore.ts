// In-memory storage for serverless environments
// Data persists during the function lifetime but resets on cold starts
import type { Database, Job, Profile, Application } from "@/types";
import seed from "@/data/db.json";

// In-memory database - initialized with seed data
let memoryDb: Database = {
  jobs: seed.jobs as Job[],
  profiles: seed.profiles as Profile[],
  applications: seed.applications as Application[],
  messages: [],
  videoCalls: [],
};

// Reset to seed data (useful for testing)
export function resetMemoryDb(): void {
  memoryDb = {
    jobs: seed.jobs as Job[],
    profiles: seed.profiles as Profile[],
    applications: seed.applications as Application[],
    messages: [],
    videoCalls: [],
  };
}

// Get a copy of the database
export function getMemoryDb(): Database {
  return {
    jobs: [...memoryDb.jobs],
    profiles: [...memoryDb.profiles],
    applications: [...memoryDb.applications],
    messages: [...memoryDb.messages],
    videoCalls: [...memoryDb.videoCalls],
  };
}

// Update the database
export function setMemoryDb(db: Database): void {
  memoryDb = {
    jobs: [...db.jobs],
    profiles: [...db.profiles],
    applications: [...db.applications],
    messages: [...db.messages],
    videoCalls: [...db.videoCalls],
  };
}

// Export for direct access (be careful with mutations)
export { memoryDb };
