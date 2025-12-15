// Daily.co video call integration
import Daily, { DailyCall } from '@daily-co/daily-js';

let callFrame: DailyCall | null = null;

export interface VideoCallConfig {
  roomUrl: string;
  userName: string;
  containerElement?: HTMLElement;
}

/**
 * Create or get existing Daily.co call frame
 */
export async function createVideoCall(config: VideoCallConfig): Promise<DailyCall> {
  // If we already have a call frame, leave it first
  if (callFrame) {
    await leaveVideoCall();
  }

  // Create new call frame
  callFrame = Daily.createFrame(config.containerElement || document.body, {
    showLeaveButton: true,
    showFullscreenButton: true,
    iframeStyle: {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      border: '0',
      zIndex: '9999',
    },
  });

  // Join the room
  await callFrame.join({
    url: config.roomUrl,
    userName: config.userName,
  });

  return callFrame;
}

/**
 * Leave current video call
 */
export async function leaveVideoCall(): Promise<void> {
  if (callFrame) {
    await callFrame.leave();
    await callFrame.destroy();
    callFrame = null;
  }
}

/**
 * Get current call frame
 */
export function getCurrentCall(): DailyCall | null {
  return callFrame;
}

/**
 * Toggle camera on/off
 */
export async function toggleCamera(enabled: boolean): Promise<void> {
  if (callFrame) {
    await callFrame.setLocalVideo(enabled);
  }
}

/**
 * Toggle microphone on/off
 */
export async function toggleMicrophone(enabled: boolean): Promise<void> {
  if (callFrame) {
    await callFrame.setLocalAudio(enabled);
  }
}

/**
 * Create a temporary room (no Daily.co account needed for demo)
 */
export async function createDemoRoom(): Promise<string> {
  try {
    // Use Daily.co's demo rooms API (no auth required)
    const response = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          enable_screenshare: true,
          enable_chat: false,
          start_video_off: false,
          start_audio_off: false,
          exp: Math.round(Date.now() / 1000) + (60 * 60), // 1 hour
        },
      }),
    });

    if (!response.ok) {
      // Fallback: create a demo room URL (works without API key for testing)
      const roomName = `myhire-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      return `https://myhire.daily.co/${roomName}`;
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Failed to create room:', error);
    // Fallback URL
    const roomName = `myhire-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    return `https://myhire.daily.co/${roomName}`;
  }
}
