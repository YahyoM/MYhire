import { useState, useEffect, useRef, useCallback } from "react";
import type { Application, Message, VideoCall } from "@/types";
import { getStorage } from "@/lib/demoStorage";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application;
  userRole: "employer" | "jobseeker";
}

export function ChatModal({ isOpen, onClose, application, userRole }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [activeCall, setActiveCall] = useState<VideoCall | null>(null);
  const [incomingCall, setIncomingCall] = useState<VideoCall | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  const userEmail = typeof window !== 'undefined' ? getStorage().getItem("userEmail") || "" : "";

  // Scroll to bottom only when sending new messages (not on load)
  useEffect(() => {
    // Don't scroll the whole page - only scroll inside the chat container
    if (!messagesContainerRef.current) return;
    
    const container = messagesContainerRef.current;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    
    // Only auto-scroll if user is near bottom or chat just opened
    if (isNearBottom || messages.length === 0) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const loadMessages = useCallback(async () => {
    if (!application?.id) return;
    try {
      const res = await fetch(`/api/chat?applicationId=${application.id}`);
      const data = await res.json();
      
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (_error) {
      // Silently fail
    }
  }, [application?.id]);

  const markMessagesAsRead = useCallback(async () => {
    if (!application?.id) return;
    try {
      await fetch("/api/chat", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: application.id,
          userEmail,
        }),
      });
    } catch (_error) {
      // Silently fail
    }
  }, [application?.id, userEmail]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || loading || !application?.id) return;

    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: application.id,
          sender: userRole === "employer" ? "employer" : "candidate",
          senderEmail: userEmail,
          text: inputText.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages([...messages, data.message]);
        setInputText("");
        await loadMessages(); // Reload to ensure sync
      }
    } catch (_error) {
        alert("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const joinCall = useCallback(async () => {
    try {
      console.log("[joinCall] Requesting camera/microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      
      console.log("[joinCall] Media stream obtained, starting video");
      setLocalStream(stream);
      setIsVideoCall(true);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Failed to access camera/microphone:", error);
      alert("Failed to access camera or microphone. Please check your permissions.");
    }
  }, []);

  const endVideoCall = useCallback(async () => {
    if (activeCall) {
      try {
        await fetch("/api/videocall", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            callId: activeCall.id,
            status: "ended",
          }),
        });
      } catch (error) {
        console.error("Failed to end call in database:", error);
      }
    }

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    setIsVideoCall(false);
    setIsAudioEnabled(true);
    setIsVideoEnabled(true);
    setActiveCall(null);
    setIncomingCall(null);
  }, [activeCall, localStream]);

  const checkForCalls = useCallback(async () => {
    if (!application?.id) return;
    try {
      const res = await fetch(`/api/videocall?applicationId=${application.id}`);
      const data = await res.json();
      
      if (data.call) {
        setActiveCall(data.call);
        
        // Check if it's an incoming call (not initiated by us)
        if (data.call.initiatorEmail !== userEmail && data.call.status === "calling") {
          setIncomingCall(data.call);
        } else if (data.call.status === "active") {
          // Call is active, show video interface
          if (!isVideoCall) {
            await joinCall();
          }
        } else if (data.call.status === "ended") {
          // Call ended, clean up
          endVideoCall();
        }
      } else {
        setActiveCall(null);
        setIncomingCall(null);
      }
    } catch (_error) {
        // Silently fail
    }
  }, [application?.id, userEmail, isVideoCall, joinCall, endVideoCall]);

  // Load messages when modal opens
  useEffect(() => {
    if (isOpen && application?.id) {
      void loadMessages();
      void checkForCalls();
      
      // Poll for new messages and calls every 3 seconds
      const interval = setInterval(() => {
        void loadMessages();
        void checkForCalls();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [checkForCalls, isOpen, application?.id, loadMessages]);

  // Mark messages as read when opening chat
  useEffect(() => {
    if (isOpen && application?.id && userEmail) {
      void markMessagesAsRead();
    }
  }, [isOpen, application?.id, markMessagesAsRead, userEmail]);

  const startVideoCall = async () => {
    if (!application?.id) return;
    try {
      // Request camera FIRST while we have user gesture
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      
      // Now create call in database
      const res = await fetch("/api/videocall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: application.id,
          initiatorEmail: userEmail,
          initiatorRole: userRole === "employer" ? "employer" : "candidate",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveCall(data.call);
        
        // Set the stream we already got
        setLocalStream(stream);
        setIsVideoCall(true);
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } else {
        // Clean up stream if call creation failed
        stream.getTracks().forEach(track => track.stop());
        alert("Failed to create call. Please try again.");
      }
    } catch (error) {
      if (error instanceof Error && error.name === "NotAllowedError") {
        alert("Camera/microphone access denied. Please click the camera icon in your browser's address bar to allow access, then try again.");
      } else if (error instanceof Error && error.name === "NotFoundError") {
        alert("No camera or microphone found. Please connect a device and try again.");
      } else if (error instanceof Error && error.name === "NotReadableError") {
        alert("Camera/microphone is already in use. Please close other apps (Zoom, Teams, etc.) and try again.");
      } else {
        alert("Failed to start video call. Please check camera permissions and try again.");
      }
    }
  };

  const answerCall = async () => {
    if (!incomingCall) return;
    
    try {
      // CRITICAL: Request camera/mic FIRST while we still have user gesture!
      // This must happen synchronously before any await/async operations
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      
      // Now that we have the stream, update the call status
      const res = await fetch("/api/videocall", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callId: incomingCall.id,
          status: "active",
        }),
      });

      if (res.ok) {
        setIncomingCall(null);
        
        // Set the stream we already got
        setLocalStream(stream);
        setIsVideoCall(true);
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } else {
        // Clean up stream if API call failed
        stream.getTracks().forEach(track => track.stop());
        alert("Failed to answer call. Please try again.");
      }
    } catch (error) {
      if (error instanceof Error && error.name === "NotAllowedError") {
        alert("Camera/microphone access denied. Please allow access in your browser settings and try again.");
      } else if (error instanceof Error && error.name === "NotFoundError") {
        alert("No camera or microphone found. Please connect a device and try again.");
      } else if (error instanceof Error && error.name === "NotReadableError") {
        alert("Camera/microphone is already in use by another application. Please close other apps and try again.");
      } else {
        alert("Failed to access camera/microphone. Please check your browser permissions and try again.");
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Incoming Call Notification */}
      {incomingCall && !isVideoCall && (
        <div className="absolute inset-0 z-60 flex items-center justify-center bg-slate-900/90 backdrop-blur-md">
          <div className="rounded-3xl border-2 border-green-400 bg-gradient-to-br from-slate-800 to-slate-900 p-8 shadow-2xl">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-75"></div>
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-500">
                  <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
              </div>
            </div>
            <h3 className="mb-2 text-center text-2xl font-bold text-white">
              Incoming Video Call
            </h3>
            <p className="mb-6 text-center text-slate-300">
              {userRole === "employer" ? application.fullName : application.company} is calling...
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setIncomingCall(null)}
                className="flex-1 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition-all hover:bg-red-700"
              >
                Decline
              </button>
              <button
                onClick={answerCall}
                className="flex-1 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition-all hover:bg-green-700"
              >
                Answer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative flex h-[85vh] w-full max-w-4xl flex-col rounded-2xl border border-blue-200/50 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {userRole === "employer" ? application.fullName : application.company}
            </h2>
            <p className="text-sm text-slate-600">
              {userRole === "employer" ? application.email : application.jobTitle}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isVideoCall ? (
              <button
                onClick={startVideoCall}
                className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Start Video Call
              </button>
            ) : (
              <button
                onClick={endVideoCall}
                className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-red-600 to-red-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                End Call
              </button>
            )}
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-100"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Video Call Area */}
        {isVideoCall && (
          <div className="relative border-b border-slate-200 bg-slate-900 p-4">
            <div className="relative aspect-video overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-slate-900">
              {/* Remote video (simulated - in real app would be WebRTC peer connection) */}
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mb-4 inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500">
                    <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p className="text-lg font-semibold text-white">
                    {userRole === "employer" ? application.fullName : application.company}
                  </p>
                  <p className="mt-2 flex items-center justify-center gap-2 text-sm text-green-400">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                    Waiting to connect...
                  </p>
                </div>
              </div>
              
              {/* Local video preview */}
              <div className="absolute bottom-4 right-4 h-32 w-48 overflow-hidden rounded-lg border-2 border-white/20 bg-slate-800">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`h-full w-full object-cover ${isVideoEnabled ? '' : 'hidden'}`}
                />
                {!isVideoEnabled && (
                  <div className="flex h-full items-center justify-center">
                    <svg className="h-8 w-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
            
            {/* Video controls */}
            <div className="mt-4 flex items-center justify-center gap-3">
              <button 
                onClick={toggleAudio}
                className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${
                  isAudioEnabled 
                    ? 'bg-slate-700 text-white hover:bg-slate-600' 
                    : 'bg-red-600 text-white hover:bg-red-500'
                }`}
              >
                {isAudioEnabled ? (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                )}
              </button>
              
              <button 
                onClick={toggleVideo}
                className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${
                  isVideoEnabled 
                    ? 'bg-slate-700 text-white hover:bg-slate-600' 
                    : 'bg-red-600 text-white hover:bg-red-500'
                }`}
              >
                {isVideoEnabled ? (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                  </svg>
                )}
              </button>
              
              <button className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-700 text-white transition-all hover:bg-slate-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <svg className="mb-4 h-16 w-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-lg font-medium text-slate-600">No messages yet</p>
              <p className="text-sm text-slate-500">Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => {
                const isMyMessage = 
                  (userRole === "employer" && msg.sender === "employer") ||
                  (userRole === "jobseeker" && msg.sender === "candidate");
                
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        isMyMessage
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <p
                        className={`mt-1 text-xs ${
                          isMyMessage ? "text-blue-100" : "text-slate-500"
                        }`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-200 p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              disabled={loading}
              className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-500 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || loading}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {loading ? (
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
