import type { NextApiRequest, NextApiResponse } from "next";
import { readDb, writeDb } from "@/lib/kvStore";
import type { Message } from "@/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    // Get messages for a specific application
    const { applicationId } = req.query;

    if (!applicationId || typeof applicationId !== "string") {
      return res.status(400).json({ error: "Application ID is required" });
    }

    try {
      const data = await readDb();
      const messages = data.messages.filter(
        (msg: Message) => msg.applicationId === applicationId
      );
      
      return res.status(200).json({ messages });
    } catch (_error) {
      return res.status(500).json({ error: "Failed to fetch messages" });
    }
  }

  if (req.method === "POST") {
    // Send a new message
    const { applicationId, sender, senderEmail, text } = req.body;

    if (!applicationId || !sender || !senderEmail || !text) {
      return res.status(400).json({ 
        error: "Missing required fields: applicationId, sender, senderEmail, text" 
      });
    }

    if (sender !== "employer" && sender !== "candidate") {
      return res.status(400).json({ 
        error: "Sender must be 'employer' or 'candidate'" 
      });
    }

    try {
      const data = await readDb();

      const newMessage: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        applicationId,
        sender,
        senderEmail,
        text: text.trim(),
        timestamp: new Date().toISOString(),
        read: false,
      };

      data.messages.push(newMessage);
      await writeDb(data);

      return res.status(201).json({ message: newMessage });
    } catch (_error) {
      return res.status(500).json({ error: "Failed to send message" });
    }
  }

  if (req.method === "PATCH") {
    // Mark messages as read
    const { applicationId, userEmail } = req.body;

    if (!applicationId || !userEmail) {
      return res.status(400).json({ 
        error: "Missing required fields: applicationId, userEmail" 
      });
    }

    try {
      const data = await readDb();
      
      // Mark all messages in this application not sent by userEmail as read
      data.messages = data.messages.map((msg: Message) => {
        if (msg.applicationId === applicationId && msg.senderEmail !== userEmail) {
          return { ...msg, read: true };
        }
        return msg;
      });

      await writeDb(data);

      return res.status(200).json({ success: true });
    } catch (_error) {
      return res.status(500).json({ error: "Failed to mark messages as read" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
