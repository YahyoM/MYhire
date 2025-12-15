import type { NextApiRequest, NextApiResponse } from "next";
import { createJob, listJobs, readDb, writeDb } from "@/lib/kvStore";
import type { Job } from "@/types";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "5mb",
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  try {
    if (req.method === "GET") {
      const jobs = await listJobs();
      res.status(200).json({ jobs });
      return;
    }

    if (req.method === "POST") {
      const {
        title,
        company,
        location,
        type,
        experience,
        skills,
        salary,
        description,
        mode,
        employerEmail,
      } = req.body;

      if (!title || !company || !location || !type || !description) {
        res.status(400).json({ message: "Missing required job fields" });
        return;
      }

      const normalizedSkills = Array.isArray(skills)
        ? skills
        : typeof skills === "string"
          ? skills.split(",").map((s: string) => s.trim()).filter(Boolean)
          : [];

      const job = await createJob({
        title,
        company,
        location,
        type,
        experience: experience ?? "Mid-level",
        skills: normalizedSkills,
        salary,
        description,
        mode,
        employerEmail,
      });

      res.status(201).json({ job });
      return;
    }

    if (req.method === "PUT") {
      // Update job
      const { jobId, updates } = req.body;

      if (!jobId || !updates) {
        res.status(400).json({ message: "Missing jobId or updates" });
        return;
      }

      const data = await readDb();
      const jobIndex = data.jobs.findIndex((j: Job) => j.id === jobId);

      if (jobIndex === -1) {
        res.status(404).json({ message: "Job not found" });
        return;
      }

      // Update job with new data
      data.jobs[jobIndex] = {
        ...data.jobs[jobIndex],
        ...updates,
      };

      await writeDb(data);
      res.status(200).json({ job: data.jobs[jobIndex] });
      return;
    }

    if (req.method === "PATCH") {
      // Update job status (open/closed)
      const { jobId, status } = req.body;

      if (!jobId || !status) {
        res.status(400).json({ message: "Missing jobId or status" });
        return;
      }

      const data = await readDb();
      const job = data.jobs.find((j: Job) => j.id === jobId);

      if (!job) {
        res.status(404).json({ message: "Job not found" });
        return;
      }

      job.status = status;
      await writeDb(data);
      res.status(200).json({ job });
      return;
    }

    res.setHeader("Allow", ["GET", "POST", "PUT", "PATCH"]);
    res.status(405).end("Method Not Allowed");
  } catch (_error) {
    res.status(500).json({ message: "Failed to process jobs request" });
  }
}
