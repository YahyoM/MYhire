import type { NextApiRequest, NextApiResponse } from "next";
import { listProfiles, saveResumeFile, upsertProfile } from "@/lib/dataStore";

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
      const userEmail = req.query.email as string | undefined;
      const profiles = await listProfiles();
      
      if (userEmail) {
        // Filter by email if provided
        const userProfile = profiles.find(
          (p) => p.email.toLowerCase() === userEmail.toLowerCase()
        );
        res.status(200).json({ profile: userProfile || null });
      } else {
        res.status(200).json({ profiles });
      }
      return;
    }

    if (req.method === "POST") {
      const { name, email, headline, skills, bio, links, resume, id } = req.body;

      if (!name || !email || !headline) {
        res.status(400).json({ message: "Name, email, and headline are required" });
        return;
      }

      let resumeUrl: string | undefined = resume?.url;
      if (resume?.base64 && resume?.fileName) {
        resumeUrl = await saveResumeFile({
          base64: resume.base64,
          fileName: resume.fileName,
        });
      }

      const normalizedSkills = Array.isArray(skills)
        ? skills
        : typeof skills === "string"
          ? skills.split(",").map((s: string) => s.trim()).filter(Boolean)
          : [];

      const profile = await upsertProfile({
        id,
        name,
        email,
        headline,
        skills: normalizedSkills,
        bio,
        resumeUrl,
        links: links ?? [],
      });

      res.status(201).json({ profile });
      return;
    }

    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end("Method Not Allowed");
  } catch (_error) {
    res.status(500).json({ message: "Failed to process profile request" });
  }
}
