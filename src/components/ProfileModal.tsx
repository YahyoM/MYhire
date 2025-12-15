import { useEffect, useState } from "react";
import { usePortalStore } from "@/store/usePortalStore";
import { useSkillsInput } from "@/hooks/useSkillsInput";
import { useResumeUpload } from "@/hooks/useResumeUpload";
import { getStorage } from "@/lib/demoStorage";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { profile, saveProfile, loading, loadProfile } = usePortalStore(
    (state) => ({
      profile: state.profile,
      saveProfile: state.saveProfile,
      loading: state.loading,
      loadProfile: state.loadProfile,
    }),
  );
  
  // Don't initialize with localStorage on mount - wait for modal to open
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [links, setLinks] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  const {
    skills,
    inputValue,
    setInputValue,
    addSkill,
    removeSkill,
    handleKeyDown,
    setSkills,
  } = useSkillsInput(profile?.skills ?? []);

  const { fileMeta, error: fileError, onFileChange, resetFile } =
    useResumeUpload();

  useEffect(() => {
    // Reload profile when modal opens
    if (isOpen) {
      void loadProfile();
    }
  }, [loadProfile, isOpen]);

  useEffect(() => {
    // Reload data when modal opens or profile changes
    if (isOpen) {
      const role = getStorage().getItem("userRole");
      setUserRole(role);
      
      if (profile) {
        setName(profile.name);
        setEmail(profile.email);
        setHeadline(profile.headline);
        setBio(profile.bio ?? "");
        setLinks((profile.links ?? []).join(", "));
        setSkills(profile.skills ?? []);
      } else {
        // If no profile, use fresh localStorage data
        const storedName = getStorage().getItem("userName");
        const storedEmail = getStorage().getItem("userEmail");
        setName(storedName ?? "");
        setEmail(storedEmail ?? "");
        setHeadline("");
        setBio("");
        setLinks("");
        setSkills([]);
      }
    }
  }, [profile, setSkills, isOpen]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setError(null);
      setStatus("Saving your profile...");
      const parsedLinks = links
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      await saveProfile({
        id: profile?.id,
        name,
        email,
        headline,
        bio,
        skills,
        resume: fileMeta,
        links: parsedLinks,
      });
      setStatus("Profile updated successfully!");
      if (fileMeta) resetFile();
      setTimeout(() => {
        // Reload profile after saving
        void loadProfile();
        onClose();
      }, 1500);
    } catch (submitError) {
      const msg =
        submitError instanceof Error ? submitError.message : "Failed to save";
      setError(msg);
      setStatus(null);
    }
  };

  const handleClose = () => {
    // Reset status messages when closing
    setStatus(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-blue-200/50 bg-white p-4 shadow-2xl sm:rounded-2xl sm:p-6 md:p-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Your Profile
            </p>
            <h2 className="mb-2 text-2xl font-bold text-slate-800 sm:text-3xl">Your Profile</h2>
            <p className="text-sm text-slate-700">
              Create and manage your professional profile
            </p>
          </div>
          <button
            onClick={handleClose}
            className="group flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-100 hover:text-slate-800"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {profile?.resumeUrl && (
          <div className="mb-6">
            <a
              href={profile.resumeUrl}
              className="group inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-700 transition-all hover:border-blue-400/50 hover:bg-blue-500/20"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View Current Resume
            </a>
          </div>
        )}

        <form className="grid gap-3 sm:gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Full Name <span className="text-red-600">*</span></span>
            <input
              className="rounded-xl border border-blue-200/50 bg-slate-50 px-4 py-3 text-slate-800 placeholder:text-slate-500 transition-all focus:border-blue-400/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. John Doe"
              required
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Email <span className="text-red-600">*</span></span>
            <input
              type="email"
              className="rounded-xl border border-blue-200/50 bg-slate-50 px-4 py-3 text-slate-800 placeholder:text-slate-500 transition-all focus:border-blue-400/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="ivan@example.com"
              required
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">
              {userRole === 'employer' ? 'Company Name' : 'Job Title'} <span className="text-red-600">*</span>
            </span>
            <input
              className="rounded-xl border border-blue-200/50 bg-slate-50 px-4 py-3 text-slate-800 placeholder:text-slate-500 transition-all focus:border-blue-400/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={headline}
              onChange={(event) => setHeadline(event.target.value)}
              placeholder={userRole === 'employer' ? 'e.g. TechVenture Studios' : 'e.g. Full-stack Developer'}
              required
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Links (comma-separated)</span>
            <input
              className="rounded-xl border border-blue-200/50 bg-slate-50 px-4 py-3 text-slate-800 placeholder:text-slate-500 transition-all focus:border-blue-400/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={links}
              onChange={(event) => setLinks(event.target.value)}
              placeholder="portfolio.com, linkedin.com/in/you"
            />
          </label>
          <label className="col-span-2 flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">
              {userRole === 'employer' ? 'About Your Company' : 'About'}
            </span>
            <textarea
              className="h-32 resize-none rounded-xl border border-blue-200/50 bg-slate-50 px-4 py-3 text-slate-800 placeholder:text-slate-500 transition-all focus:border-blue-400/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              placeholder={userRole === 'employer' ? 'Tell candidates about your company and what makes it a great place to work...' : 'Tell employers about yourself...'}
            />
          </label>
          {userRole !== 'employer' && (
          <div className="col-span-2">
            <p className="mb-2 text-sm font-medium text-slate-700">Your Skills</p>
            <div className="flex min-h-[3.5rem] flex-wrap items-center gap-2 rounded-xl border-2 border-dashed border-blue-400/40 bg-slate-50 p-3 transition-all focus-within:border-blue-400/70 focus-within:bg-white">
              {(skills || []).map((skill) => (
                <button
                  key={skill}
                  type="button"
                  className="group flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/15 px-3 py-1.5 text-sm font-medium text-blue-700 transition-all hover:border-blue-400/50 hover:bg-blue-500/25"
                  onClick={() => removeSkill(skill)}
                >
                  {skill}
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-300/20 text-xs text-blue-700 transition-all group-hover:bg-blue-400/40">
                    ×
                  </span>
                </button>
              ))}
              <input
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={skills.length === 0 ? "React, TypeScript, Node.js" : "Add more..."}
                className="min-w-[150px] flex-1 bg-transparent px-2 py-1 text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={addSkill}
                className="rounded-full border border-blue-200/50 bg-blue-100/50 px-4 py-1.5 text-xs font-semibold text-slate-700 transition-all hover:border-blue-300 hover:bg-blue-100"
              >
                Add
              </button>
            </div>
            {skills.length > 0 && (
              <p className="mt-2 text-xs text-slate-600">
                {skills.length} skill{skills.length === 1 ? '' : 's'} added
              </p>
            )}
          </div>
          )}
          {userRole !== 'employer' && (
          <div className="col-span-2 flex flex-col gap-2">
            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Resume (PDF, up to 5MB)
            </p>
            <div className="flex flex-col gap-3 rounded-xl border-2 border-dashed border-blue-400/40 bg-slate-50 p-5 transition-all hover:border-blue-400/60">
              <label className="group cursor-pointer">
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
                  Choose file
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
              {fileError && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {fileError}
                </div>
              )}
            </div>
          </div>
          )}
          <div className="col-span-2 flex flex-col gap-3 border-t border-blue-200/50 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-xs text-slate-600">
              <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {userRole === 'employer' ? 'Build your company profile to attract top talent.' : 'Keep your profile updated for better visibility.'}
            </p>
            <button
              type="submit"
              disabled={loading}
              className="group relative overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/40 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/50 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            >
              <span className="relative z-10 flex items-center gap-2">
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    Save Profile
                    <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </span>
              <div className="absolute inset-0 -z-0 bg-gradient-to-r from-blue-500 to-blue-400 opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          </div>
          {(status || error) && (
            <p
              className={`col-span-2 text-sm ${
                status ? "text-blue-700" : "text-red-600"
              }`}
            >
              {status ?? error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
