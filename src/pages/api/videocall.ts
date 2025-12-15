import type { NextApiRequest, NextApiResponse } from "next";
import { readDb, writeDb } from "@/lib/dataStore";
import type { VideoCall } from "@/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    // Get active video call for an application
    const { applicationId } = req.query;

    if (!applicationId || typeof applicationId !== "string") {
      return res.status(400).json({ error: "Application ID is required" });
    }

    try {
      const data = await readDb();
      const activeCall = data.videoCalls.find(
        (call: VideoCall) => 
          call.applicationId === applicationId && 
          (call.status === "calling" || call.status === "active")
      );
      
      console.log(`[GET /api/videocall] applicationId=${applicationId}, found:`, activeCall ? `${activeCall.id} (${activeCall.status})` : "none");
      return res.status(200).json({ call: activeCall || null });
    } catch (error) {
      console.error("Failed to fetch video call:", error);
        return res.status(500).json({ error: "Failed to fetch video call" });
    }
  }

  if (req.method === "POST") {
    // Start a new video call
    const { applicationId, initiatorEmail, initiatorRole } = req.body;

    if (!applicationId || !initiatorEmail || !initiatorRole) {
      return res.status(400).json({ 
        error: "Missing required fields: applicationId, initiatorEmail, initiatorRole" 
      });
    }

    if (initiatorRole !== "employer" && initiatorRole !== "candidate") {
      return res.status(400).json({ 
        error: "initiatorRole must be 'employer' or 'candidate'" 
      });
    }

    try {
      const data = await readDb();

      // Check if there's already an active call
      const existingCall = data.videoCalls.find(
        (call: VideoCall) => 
          call.applicationId === applicationId && 
          (call.status === "calling" || call.status === "active")
      );

      if (existingCall) {
        console.log(`[POST /api/videocall] Existing call found:`, existingCall.id, existingCall.status);
        // If call is already active, just return it
        if (existingCall.status === "active") {
          return res.status(200).json({ call: existingCall });
        }
        
        // If someone is calling, answer it
        existingCall.status = "active";
        await writeDb(data);
        return res.status(200).json({ call: existingCall });
      }

      // Create new call
      const newCall: VideoCall = {
        id: `call-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        applicationId,
        initiatorEmail,
        initiatorRole,
        status: "calling",
        startedAt: new Date().toISOString(),
      };

      console.log(`[POST /api/videocall] Creating new call:`, newCall.id, `from ${initiatorEmail} (${initiatorRole})`);
      
      data.videoCalls.push(newCall);
      await writeDb(data);

      return res.status(201).json({ call: newCall });
    } catch (error) {
      console.error("Failed to start video call:", error);
        return res.status(500).json({ error: "Failed to start video call" });
    }
  }

  if (req.method === "PATCH") {
    // Update video call status (answer or end)
    const { callId, status } = req.body;

    if (!callId || !status) {
      return res.status(400).json({ 
        error: "Missing required fields: callId, status" 
      });
    }

    if (!["active", "ended"].includes(status)) {
      return res.status(400).json({ 
        error: "Status must be 'active' or 'ended'" 
      });
    }

    try {
      const data = await readDb();
      
      const call = data.videoCalls.find((c: VideoCall) => c.id === callId);
      if (!call) {
        return res.status(404).json({ error: "Call not found" });
      }

      console.log(`[PATCH /api/videocall] Updating call ${callId}: ${call.status} → ${status}`);
      
      call.status = status;
      if (status === "ended") {
        call.endedAt = new Date().toISOString();
      }

      await writeDb(data);

      return res.status(200).json({ call });
    } catch (_error) {
      return res.status(500).json({ error: "Failed to update video call" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
