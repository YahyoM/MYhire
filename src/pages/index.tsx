import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import type { GetServerSideProps } from "next";
import { Layout } from "@/components/Layout";
import { getStorage, isDemoModeActive } from "@/lib/demoStorage";
import { HeroSection } from "@/components/HeroSection";
import { FilterBar } from "@/components/FilterBar";
import { JobCard } from "@/components/JobCard";
import { JobForm } from "@/components/JobForm";
import { ApplicationList } from "@/components/ApplicationList";
import { CandidateList } from "@/components/CandidateList";
import { EmployerJobsList } from "@/components/EmployerJobsList";
import { MarketInsights } from "@/components/MarketInsights";
import { usePortalStore } from "@/store/usePortalStore";
import { useFilteredJobs } from "@/hooks/useFilteredJobs";
import { listJobs, listProfiles } from "@/lib/dataStore";
import {
  getMarketInsights,
  extractJobseekerProfiles,
  deriveSkillsFromProfiles,
  type MarketInsight,
} from "@/lib/marketInsights";
import type { Job, Profile } from "@/types";

const ProfileModal = dynamic(
  () => import("@/components/ProfileModal").then((mod) => mod.ProfileModal),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border border-blue-200/50 bg-white p-6 text-center text-sm text-slate-600">
        Loading profile tools…
      </div>
    ),
  },
);

const MyApplicationsModal = dynamic(
  () =>
    import("@/components/MyApplicationsModal").then((mod) => mod.MyApplicationsModal),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border border-blue-200/50 bg-white p-6 text-center text-sm text-slate-600">
        Loading applications…
      </div>
    ),
  },
);

const ApplicationModal = dynamic(
  () => import("@/components/ApplicationModal").then((mod) => mod.ApplicationModal),
  {
    ssr: false,
    loading: () => null,
  },
);

interface HomeProps {
  initialJobs: Job[];
  initialCandidates: Profile[];
  initialCandidateSkills: string[];
  marketInsights: MarketInsight[];
  marketInsightsSource: "live" | "fallback";
}

export default function Home({
  initialJobs,
  initialCandidates,
  initialCandidateSkills,
  marketInsights,
  marketInsightsSource,
}: HomeProps) {
  const router = useRouter();
  const { view } = router.query;
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { jobs, hydrateJobs, filters, setFilters } = usePortalStore((state) => ({
    jobs: state.jobs,
    hydrateJobs: state.hydrateJobs,
    filters: state.filters,
    setFilters: state.setFilters,
  }));
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isApplicationsModalOpen, setIsApplicationsModalOpen] = useState(false);
  const filteredJobs = useFilteredJobs(jobs, filters);

  useEffect(() => {
    const isDemo = isDemoModeActive();
    const storage = getStorage();
    const viewParam = view as string;
    
    if (isDemo && (viewParam === 'jobseeker' || viewParam === 'employer')) {
      // In demo mode, initialize storage with demo data
      storage.setItem('userRole', viewParam);
      storage.setItem('userEmail', `demo-${viewParam}@example.com`);
      storage.setItem('userName', viewParam === 'jobseeker' ? 'Demo Job Seeker' : 'Demo Employer');
      setUserRole(viewParam);
      setIsLoading(false);
      return;
    }
    
    // Check authentication in normal mode
    const role = storage.getItem("userRole");
    if (!role) {
      router.push("/auth");
      return;
    }
    setUserRole(role);
    setIsLoading(false);
  }, [router, view]);

  useEffect(() => {
    hydrateJobs(initialJobs);
  }, [hydrateJobs, initialJobs]);

  useEffect(() => {
    // Open profile modal if hash is #profile or clicked from navigation
    const checkHash = () => {
      if (globalThis.location.hash === '#profile' || view === 'profile') {
        setIsProfileModalOpen(true);
      }
      if (globalThis.location.hash === '#applications') {
        setIsApplicationsModalOpen(true);
      }
    };
    
    // Custom event listeners for opening modals
    const handleOpenProfile = () => {
      setIsProfileModalOpen(true);
    };
    
    const handleOpenApplications = () => {
      setIsApplicationsModalOpen(true);
    };
    
    // Check on mount and when view changes
    checkHash();
    
    // Listen for hash changes
    globalThis.addEventListener('hashchange', checkHash);
    // Listen for custom events from navigation
    globalThis.addEventListener('openProfileModal', handleOpenProfile);
    globalThis.addEventListener('openApplicationsModal', handleOpenApplications);
    
    return () => {
      globalThis.removeEventListener('hashchange', checkHash);
      globalThis.removeEventListener('openProfileModal', handleOpenProfile);
      globalThis.removeEventListener('openApplicationsModal', handleOpenApplications);
    };
  }, [view]);

  const handleBuildProfile = () => {
    setIsProfileModalOpen(true);
  };

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (isLoading) {
    return (
      <Layout
        title="Loading..."
        description="Loading PulseHire"
      >
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
            <p className="text-slate-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="MYhire | Skill-first job marketplace"
      description="Create profiles, upload resumes, post jobs, and apply with a modern Next.js job portal."
    >
      <HeroSection
        onBuildProfileClick={handleBuildProfile}
        onPostJobClick={() => scrollTo("employer")}
        userRole={userRole}
      />

      <MarketInsights
        insights={marketInsights}
        source={marketInsightsSource}
      />

      {/* Job Listings Section - Only for jobseekers */}
      {userRole === "jobseeker" && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-600">
                Live opportunities
              </p>
              <h2 className="text-2xl font-semibold text-slate-800">
                Curated openings ({filteredJobs.length} roles)
              </h2>
              <p className="text-sm text-slate-600">
                Filter by skills and work modes to find the right fit
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
              Real-time updates
            </div>
          </div>

          <FilterBar filters={filters} onChange={setFilters} />

          <section id="jobs" className="grid gap-3 sm:gap-4 md:grid-cols-2">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} onApply={setActiveJob} />
            ))}
            {!filteredJobs.length && (
              <div className="col-span-2 rounded-2xl border-2 border-slate-200 bg-white/70 p-8 text-center text-slate-600 backdrop-blur-sm">
                <svg className="mx-auto mb-4 h-16 w-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-medium">No roles match that filter</p>
                <p className="text-sm">Try adjusting skills or mode</p>
              </div>
            )}
          </section>
        </>
      )}

      {/* Role-based sections */}
      {userRole === "employer" && (
        <>
          <EmployerJobsList />
          <JobForm />
          <CandidateList
            initialCandidates={initialCandidates}
            initialSkills={initialCandidateSkills}
          />
          <ApplicationList />
        </>
      )}

      {/* Modals */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
      <MyApplicationsModal
        isOpen={isApplicationsModalOpen}
        onClose={() => setIsApplicationsModalOpen(false)}
      />
      <ApplicationModal job={activeJob} onClose={() => setActiveJob(null)} />
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async (context) => {
  const { req, query } = context;
  const cookies = req.headers.cookie || "";
  const userRole = cookies.split('; ').find(row => row.startsWith('userRole='))?.split('=')[1];
  
  // Check if user is authenticated (unless in demo mode)
  const isDemoView = query.view === 'jobseeker' || query.view === 'employer';
  
  if (!userRole && !isDemoView) {
    return {
      redirect: {
        destination: '/auth',
        permanent: false,
      },
    };
  }

  const [initialJobs, rawProfiles, marketInsightsResult] = await Promise.all([
    listJobs(),
    listProfiles(),
    getMarketInsights(),
  ]);

  const initialCandidates = extractJobseekerProfiles(rawProfiles);
  const initialCandidateSkills = deriveSkillsFromProfiles(initialCandidates);

  return {
    props: {
      initialJobs,
      initialCandidates,
      initialCandidateSkills,
      marketInsights: marketInsightsResult.insights,
      marketInsightsSource: marketInsightsResult.source,
    },
  };
};
