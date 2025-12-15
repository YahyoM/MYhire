import { useEffect, useState } from "react";
import { usePortalStore } from "@/store/usePortalStore";
import { useSkillsInput } from "@/hooks/useSkillsInput";
import { useResumeUpload } from "@/hooks/useResumeUpload";
import { getStorage } from "@/lib/demoStorage";

export function ProfileForm() {
  const { profile, saveProfile, loading, loadProfile } = usePortalStore(
    (state) => ({
      profile: state.profile,
      saveProfile: state.saveProfile,
      loading: state.loading,
      loadProfile: state.loadProfile,
    }),
  );
  
  // Get user role from storage - initialize immediately
  const [userRole, setUserRole] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return getStorage().getItem("userRole");
    }
    return null;
  });
  
  useEffect(() => {
    const role = getStorage().getItem("userRole");
    if (role !== userRole) {
      setUserRole(role);
    }
  }, [userRole]);
  
  const [name, setName] = useState(profile?.name ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [headline, setHeadline] = useState(profile?.headline ?? "");
  
  // Jobseeker fields
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [links, setLinks] = useState((profile?.links ?? []).join(", "));
  
  // Employer fields
  const [companyName, setCompanyName] = useState(profile?.companyName ?? "");
  const [companyWebsite, setCompanyWebsite] = useState(profile?.companyWebsite ?? "");
  const [companySize, setCompanySize] = useState(profile?.companySize ?? "");
  const [industry, setIndustry] = useState(profile?.industry ?? "");
  const [companyDescription, setCompanyDescription] = useState(profile?.companyDescription ?? "");
  
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    void loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name);
    setEmail(profile.email);
    setHeadline(profile.headline);
    // Jobseeker fields
    setBio(profile.bio ?? "");
    setLinks((profile.links ?? []).join(", "));
    if (profile.skills) {
      setSkills(profile.skills);
    }
    // Employer fields
    setCompanyName(profile.companyName ?? "");
    setCompanyWebsite(profile.companyWebsite ?? "");
    setCompanySize(profile.companySize ?? "");
    setIndustry(profile.industry ?? "");
    setCompanyDescription(profile.companyDescription ?? "");
  }, [profile, setSkills]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setError(null);
      setStatus("Saving your profile...");
      
      if (userRole === "jobseeker") {
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
          role: "jobseeker",
        });
        setStatus("Profile updated - you are discoverable to hiring teams.");
      } else {
        // Employer profile
        await saveProfile({
          id: profile?.id,
          name,
          email,
          headline,
          companyName,
          companyWebsite,
          companySize,
          industry,
          companyDescription,
          role: "employer",
        });
        setStatus("Company profile updated successfully.");
      }
      
      if (fileMeta) resetFile();
    } catch (submitError) {
      const msg =
        submitError instanceof Error ? submitError.message : "Failed to save";
      setError(msg);
      setStatus(null);
    }
  };

  // Show loading while determining user role
  if (!userRole) {
    return (
      <section
        id="profile"
        className="rounded-2xl border border-blue-200/50 bg-white p-6 shadow-xl shadow-blue-500/10 backdrop-blur sm:p-8"
      >
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-700">
          <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading profile...
        </div>
      </section>
    );
  }

  return (
    <section
      id="profile"
      className="rounded-2xl border border-blue-200/50 bg-white p-6 shadow-xl shadow-blue-500/10 backdrop-blur sm:p-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {userRole === "employer" ? "For Employers" : "For Job Seekers"}
          </p>
          <h2 className="mb-2 text-2xl font-bold text-slate-800 sm:text-3xl">
            {userRole === "employer" ? "Company Profile" : "Build Profile & Upload Resume"}
          </h2>
          <p className="text-sm text-slate-700">
            {userRole === "employer"
              ? "Manage your company information and attract top talent"
              : "Showcase your skills and experience to employers"}
          </p>
        </div>
        {userRole === "jobseeker" && profile?.resumeUrl && (
          <a
            href={profile.resumeUrl}
            className="group inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-700 transition-all hover:border-blue-400/50 hover:bg-blue-500/20"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            View Resume
          </a>
        )}
      </div>
      <form className="mt-6 grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit}>
        {/* Common fields */}
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">
            {userRole === "employer" ? "Contact Name" : "Full Name"} <span className="text-red-600">*</span>
          </span>
          <input
            className="rounded-xl border border-blue-200/50 bg-slate-50 px-4 py-3 text-slate-800 placeholder:text-slate-500 transition-all focus:border-blue-400/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={userRole === "employer" ? "e.g. Jane Smith" : "e.g. John Doe"}
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
            placeholder="email@example.com"
            required
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">
            {userRole === "employer" ? "Your Role" : "Job Title"} <span className="text-red-600">*</span>
          </span>
          <input
            className="rounded-xl border border-blue-200/50 bg-slate-50 px-4 py-3 text-slate-800 placeholder:text-slate-500 transition-all focus:border-blue-400/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            value={headline}
            onChange={(event) => setHeadline(event.target.value)}
            placeholder={userRole === "employer" ? "e.g. HR Manager" : "e.g. Full-stack Developer"}
            required
          />
        </label>

        {/* Employer-specific fields */}
        {userRole === "employer" ? (
          <>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Company Name <span className="text-red-600">*</span></span>
              <input
                className="rounded-xl border border-blue-200/50 bg-slate-50 px-4 py-3 text-slate-800 placeholder:text-slate-500 transition-all focus:border-blue-400/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                placeholder="e.g. TechCorp Inc."
                required
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Company Website</span>
              <input
                type="url"
                className="rounded-xl border border-blue-200/50 bg-slate-50 px-4 py-3 text-slate-800 placeholder:text-slate-500 transition-all focus:border-blue-400/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={companyWebsite}
                onChange={(event) => setCompanyWebsite(event.target.value)}
                placeholder="https://company.com"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Company Size</span>
              <select
                className="rounded-xl border border-blue-200/50 bg-slate-50 px-4 py-3 text-slate-800 transition-all focus:border-blue-400/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={companySize}
                onChange={(event) => setCompanySize(event.target.value)}
              >
                <option value="">Select size...</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501-1000">501-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Industry</span>
              <input
                className="rounded-xl border border-blue-200/50 bg-slate-50 px-4 py-3 text-slate-800 placeholder:text-slate-500 transition-all focus:border-blue-400/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={industry}
                onChange={(event) => setIndustry(event.target.value)}
                placeholder="e.g. Technology, Healthcare, Finance"
              />
            </label>
            <label className="col-span-2 flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Company Description</span>
              <textarea
                className="h-32 resize-none rounded-xl border border-blue-200/50 bg-slate-50 px-4 py-3 text-slate-800 placeholder:text-slate-500 transition-all focus:border-blue-400/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={companyDescription}
                onChange={(event) => setCompanyDescription(event.target.value)}
                placeholder="Tell candidates about your company, culture, and mission..."
              />
            </label>
          </>
        ) : (
          <>
            {/* Jobseeker-specific fields */}
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
              <span className="text-sm font-medium text-slate-700">About</span>
              <textarea
                className="h-32 resize-none rounded-xl border border-blue-200/50 bg-slate-50 px-4 py-3 text-slate-800 placeholder:text-slate-500 transition-all focus:border-blue-400/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                placeholder="Tell employers about yourself..."
              />
            </label>
            <div className="col-span-2">
              <p className="mb-2 text-sm font-medium text-slate-700">Your Skills (comma-separated)</p>
              <div className="flex min-h-[3.5rem] flex-wrap items-center gap-2 rounded-xl border-2 border-dashed border-blue-400/40 bg-slate-50 p-3 transition-all focus-within:border-blue-400/70 focus-within:bg-white">
                {skills.map((skill) => (
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
          </>
        )}
        <div className="col-span-2 flex flex-col gap-3 border-t border-blue-200/50 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-xs text-slate-600">
            <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Keep your profile updated - employers will see your skills immediately.
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
                  Uploading...
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
    </section>
  );
}
