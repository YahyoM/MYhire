import type { NextApiRequest, NextApiResponse } from "next";
import {
  addApplication,
  listApplications,
  saveResumeFile,
  updateApplicationStatus,
  enableChatForApplication,
} from "@/lib/dataStore";
import type { Application } from "@/types";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  try {
    if (req.method === "GET") {
      const jobId = req.query.jobId as string | undefined;
      const userEmail = req.query.userEmail as string | undefined;
      
      if (userEmail) {
        // Get applications by user email
        const allApplications = await listApplications();
        const userApplications = allApplications.filter(
          (app) => app.email.toLowerCase() === userEmail.toLowerCase()
        );
        res.status(200).json(userApplications);
        return;
      }
      
      const applications = await listApplications(jobId);
      res.status(200).json({ applications });
      return;
    }

    if (req.method === "POST") {
      const { jobId, fullName, email, message, resume, profileId, skills } = req.body;
      if (!jobId || !fullName || !email || !resume?.fileName) {
        res
          .status(400)
          .json({ message: "Job ID, contact info, and resume are required" });
        return;
      }

      // Use existing resume URL if provided, otherwise save new file
      let resumeUrl: string;
      if (resume.url && !resume.base64) {
        // Using existing resume from profile
        resumeUrl = resume.url;
      } else if (resume.base64) {
        // Uploading new resume
        resumeUrl = await saveResumeFile({
          base64: resume.base64,
          fileName: resume.fileName,
        });
      } else {
        res.status(400).json({ message: "Resume file or URL is required" });
        return;
      }

      const application = await addApplication({
        jobId,
        fullName,
        email,
        message,
        resumeUrl,
        profileId,
        skills,
      });

      res.status(201).json({ application });
      return;
    }

    if (req.method === "PATCH") {
      const { id, status, chatEnabled } = req.body;
      if (!id) {
        res.status(400).json({ message: "Application id is required" });
        return;
      }

      let updated: Application;
      
      if (status !== undefined) {
        updated = await updateApplicationStatus(id, status);
      } else if (chatEnabled !== undefined) {
        updated = await enableChatForApplication(id, chatEnabled);
      } else {
        res.status(400).json({ message: "Either status or chatEnabled is required" });
        return;
      }

      res.status(200).json({ application: updated });
      return;
    }

    res.setHeader("Allow", ["GET", "POST", "PATCH"]);
    res.status(405).end("Method Not Allowed");
  } catch (_error) {
    res.status(500).json({ message: "Failed to process applications request" });
  }
}
