import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePortalStore } from "@/store/usePortalStore";
import type { Job } from "@/types";
import { useResumeUpload } from "@/hooks/useResumeUpload";
import { getStorage } from "@/lib/demoStorage";

interface ApplicationModalProps {
  job: Job | null;
  onClose: () => void;
}

export function ApplicationModal({ job, onClose }: Readonly<ApplicationModalProps>) {
  const { submitApplication, profile, loading } = usePortalStore((state) => ({
    submitApplication: state.submitApplication,
    profile: state.profile,
    loading: state.loading,
  }));
  const { fileMeta, error: fileError, onFileChange, resetFile } =
    useResumeUpload();
  
  // Initialize with empty values
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [message, setMessage] = useState("Excited to join your team!");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Auto-fill name and email from profile or localStorage when modal opens
  useEffect(() => {
    if (job) {
      const storedName = profile?.name || getStorage().getItem("userName") || "";
      const storedEmail = profile?.email || getStorage().getItem("userEmail") || "";
      const profileSkills = profile?.skills || [];
      setFullName(storedName);
      setEmail(storedEmail);
      setSkills(profileSkills);
      setStatus(null);
      setError(null);
      setIsSubmitted(false); // Reset submission state when job changes
      resetFile(); // Reset file when opening new application
      
      // Auto-fill resume from profile if available
      if (profile?.resumeUrl) {
        // Set a placeholder for existing resume from profile
        // The actual file will be sent as URL reference
        setStatus("Using resume from your profile");
      }
    }
  }, [job, profile, resetFile]);

  if (!job) return null;

  // Check if user has profile data
  const hasProfileData = !!(profile?.name && profile?.email) || 
                         !!(getStorage().getItem("userName") && getStorage().getItem("userEmail"));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Use profile resume if available and no new file uploaded
    const resumeToUse = fileMeta || (profile?.resumeUrl ? { 
      fileName: profile.resumeUrl.split('/').pop() || 'resume.pdf',
      base64: '', // Empty base64 for existing resume
      url: profile.resumeUrl 
    } : null);
    
    if (!resumeToUse) {
      setError("Please attach your resume or create a profile with your resume.");
      return;
    }
    
    try {
      setError(null);
      setStatus("Submitting your application...");
      await submitApplication({
        jobId: job.id,
        fullName,
        email,
        skills,
        message,
        resume: resumeToUse,
        profileId: profile?.id,
      });
      setStatus("✓ Applied successfully!");
      setIsSubmitted(true);
      
      // Trigger a custom event to refresh applications list
      const event = new Event('applicationSubmitted');
      globalThis.dispatchEvent(event);
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (submitError) {
      const msg =
        submitError instanceof Error ? submitError.message : "Failed to apply";
      setError(msg);
      setStatus(null);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-40 flex items-start sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm overflow-y-auto py-4 px-2 sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl my-auto rounded-xl sm:rounded-2xl md:rounded-3xl border border-blue-200/50 bg-white text-slate-800 shadow-2xl">
          {/* Decorative gradient */}
          <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 sm:h-40 sm:w-40 bg-gradient-to-bl from-blue-500/10 to-transparent" />
          
          {/* Content wrapper with padding */}
          <div className="px-3 py-3 sm:px-6 sm:py-6 md:px-8 md:py-8">
          <div className="relative flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1 min-w-0">
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] sm:tracking-[0.24em] text-blue-600">
                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Apply for Position
              </p>
              <h3 className="mb-2 text-xl font-bold text-slate-800 sm:text-2xl md:text-3xl leading-tight">
                {job.title}
              </h3>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-700">
                <span className="font-semibold text-blue-600">{job.company}</span>
                <span className="text-slate-400">•</span>
                <span className="truncate max-w-[120px] sm:max-w-none">{job.location}</span>
                <span className="text-slate-500">•</span>
                <span>{job.type}</span>
                <span className="text-slate-500 hidden sm:inline">•</span>
                <span className="hidden sm:inline">{job.mode ?? "Flexible"}</span>
              </div>
            </div>
            <button
              className="group flex h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-full border border-blue-200/50 text-slate-700 transition-all hover:border-red-400/50 hover:bg-red-500/10 hover:text-red-600 self-start"
              onClick={onClose}
              aria-label="Close modal"
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form className="relative mt-4 sm:mt-6 space-y-3 sm:space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-1.5 sm:gap-2">
                <span className="text-xs sm:text-sm font-medium text-slate-700">
                  Full Name <span className="text-red-600">*</span>
                  {hasProfileData && (
                    <span className="ml-1 sm:ml-2 text-xs font-normal text-blue-600">(from profile)</span>
                  )}
                </span>
                <input
                  className={`rounded-lg sm:rounded-xl border border-blue-200/50 px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-slate-800 placeholder:text-slate-500 transition-all focus:border-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    hasProfileData ? 'bg-blue-50/50 cursor-not-allowed' : 'bg-slate-50 focus:bg-white'
                  }`}
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Your full name"
                  required
                  readOnly={hasProfileData}
                />
              </label>
              <label className="flex flex-col gap-1.5 sm:gap-2">
                <span className="text-xs sm:text-sm font-medium text-slate-700">
                  Email <span className="text-red-600">*</span>
                  {hasProfileData && (
                    <span className="ml-1 sm:ml-2 text-xs font-normal text-blue-600">(from profile)</span>
                  )}
                </span>
                <input
                  className={`rounded-lg sm:rounded-xl border border-blue-200/50 px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-slate-800 placeholder:text-slate-500 transition-all focus:border-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    hasProfileData ? 'bg-blue-50/50 cursor-not-allowed' : 'bg-slate-50 focus:bg-white'
                  }`}
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="your@email.com"
                  required
                  readOnly={hasProfileData}
                />
              </label>
            </div>
            <label className="flex flex-col gap-1.5 sm:gap-2">              <span className="text-xs sm:text-sm font-medium text-slate-700">
                Your Skills
                {profile?.skills && profile.skills.length > 0 && (
                  <span className="ml-1 sm:ml-2 text-xs font-normal text-blue-600">(from profile)</span>
                )}
              </span>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl border border-blue-200/50 bg-slate-50 px-3 py-2.5 sm:px-4 sm:py-3 text-slate-800 min-h-[2.5rem] sm:min-h-[3rem]">
                {skills.length > 0 ? (
                  skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-700"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">No skills added to your profile yet</span>
                )}
              </div>
            </label>
            <label className="flex flex-col gap-1.5 sm:gap-2">              <span className="text-xs sm:text-sm font-medium text-slate-700">Cover Letter</span>
              <textarea
                className="h-24 sm:h-32 resize-none rounded-lg sm:rounded-xl border border-blue-200/50 bg-slate-50 px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-slate-800 placeholder:text-slate-500 transition-all focus:border-blue-400/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Why are you a good fit for this role?"
              />
            </label>
            <div className="flex flex-col gap-1.5 sm:gap-2">
              <p className="mb-1 sm:mb-2 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-slate-700">
                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Resume <span className="text-red-600">*</span>
                {profile?.resumeUrl && !fileMeta && (
                  <span className="ml-2 text-xs font-normal text-green-600">(using resume from profile)</span>
                )}
              </p>
              <div className="flex flex-col gap-2 sm:gap-3 rounded-lg sm:rounded-xl border-2 border-dashed border-blue-400/40 bg-slate-50 p-3 sm:p-4 transition-all focus-within:border-blue-400/70">
                {profile?.resumeUrl && !fileMeta ? (
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-green-400/30 bg-green-500/10 p-3">
                    <div className="flex items-center gap-2">
                      <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium text-green-700">
                        Resume from profile
                      </span>
                    </div>
                    <a
                      href={profile.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-green-700 underline hover:text-green-800"
                    >
                      View
                    </a>
                  </div>
                ) : null}
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(event) => onFileChange(event.target.files)}
                    className="hidden"
                  />
                  <div className="flex items-center justify-center gap-3 rounded-lg border border-blue-200/50 bg-blue-100/50 px-4 py-3 text-sm text-slate-700 transition-all hover:border-blue-300 hover:bg-blue-100">
                    <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {profile?.resumeUrl ? 'Upload different resume (optional)' : 'Choose file'}
                  </div>
                </label>
                {fileMeta && (
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-blue-400/30 bg-blue-500/10 p-3">
                    <div className="flex items-center gap-2">
                      <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium text-blue-700">{fileMeta.fileName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={resetFile}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-300/20 text-blue-700 transition-all hover:bg-blue-400/40"
                    >
                      ×
                    </button>
                  </div>
                )}
                {(fileError || error) && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {fileError ?? error}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:gap-3 border-t border-blue-200/50 pt-3 sm:pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-600 leading-tight">
                <svg className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="flex-1">Ваши данные будут надёжно переданы в {job.company}</span>
              </p>
              <button
                type="submit"
                disabled={loading || isSubmitted}
                className={`group relative overflow-hidden rounded-full px-5 py-2.5 sm:px-6 sm:py-3 text-sm font-semibold text-white shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 w-full sm:w-auto ${
                  isSubmitted 
                    ? 'bg-gradient-to-r from-green-600 to-green-500 shadow-green-600/40' 
                    : 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-blue-600/40 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/50'
                }`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {isSubmitted ? (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Submitted
                    </>
                  ) : loading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </span>
                <div className="absolute inset-0 -z-0 bg-gradient-to-r from-blue-500 to-blue-400 opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            </div>
            {status && (
              <p className="text-sm text-blue-700" data-testid="status-message">
                {status}
              </p>
            )}
          </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
