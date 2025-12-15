import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface HeroSectionProps {
  onPostJobClick?: () => void;
  onBuildProfileClick?: () => void;
  userRole?: string | null;
}

export function HeroSection({
  onPostJobClick,
  onBuildProfileClick,
  userRole,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-blue-200/50 bg-gradient-to-br from-white via-blue-50/40 to-purple-50 p-4 shadow-xl shadow-blue-200/20 sm:rounded-3xl sm:p-6 md:p-8 lg:p-10">
      {/* Enhanced animated background blobs */}
      <div className="absolute -left-20 -top-24 h-56 w-56 animate-pulse-glow rounded-full bg-blue-400/20 blur-3xl" />
      <div className="absolute -right-10 -bottom-10 h-64 w-64 animate-pulse-glow rounded-full bg-purple-400/20 blur-3xl" style={{ animationDelay: '2s' }} />
      <div className="absolute left-1/2 top-1/2 h-40 w-40 animate-pulse-glow rounded-full bg-indigo-400/15 blur-3xl" style={{ animationDelay: '3s' }} />
      
      <div className="relative">
        <div className="mx-auto flex max-w-4xl flex-col gap-6 text-center sm:text-left">
          <motion.p
            className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-blue-700 shadow-lg shadow-blue-500/10 sm:text-sm sm:mx-0"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
            Future-forward job market
          </motion.p>
          <motion.h1
            className="mb-3 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-2xl font-bold leading-tight text-transparent sm:mb-4 sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Build your team or land your next role with{" "}
            <span className="gradient-text">confidence</span>.
          </motion.h1>
          <motion.p
            className="mx-auto max-w-2xl text-base text-slate-700 sm:text-lg sm:mx-0"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            MYhire keeps candidates, hiring managers, and recruiters in one responsive workspace. Showcase who you are, post urgent roles, and review applicants without the back-and-forth.
          </motion.p>
          <motion.div
            className="mt-6 flex flex-wrap justify-center gap-3 sm:mt-8 sm:justify-start sm:gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <button
              onClick={onBuildProfileClick}
              className="group relative overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/40 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/50 sm:text-base"
            >
              <span className="relative z-10">
                {userRole === "employer" ? "View Applications" : "Build my profile"}
              </span>
              <div className="absolute inset-0 -z-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
            {userRole === "employer" && (
              <button
                onClick={onPostJobClick}
                className="group relative overflow-hidden rounded-full border border-blue-200 bg-white/80 px-6 py-3 text-sm font-medium text-slate-700 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-blue-300 hover:bg-white hover:text-blue-600 sm:text-base"
              >
                Post a role
              </button>
            )}
            <Link
              href="#jobs"
              className="group flex items-center gap-2 rounded-full border border-transparent px-6 py-3 text-sm font-medium text-slate-700 transition-all hover:text-blue-600 sm:text-base"
            >
              Browse openings
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
        </div>
        <div className="mt-6 flex justify-center sm:mt-8 md:mt-10 sm:justify-end">
          <Image
            src="/hero-figure.svg"
            alt="Team collaborating around hiring dashboard"
            width={520}
            height={320}
            priority
            className="w-full max-w-xs drop-shadow-xl sm:max-w-md md:max-w-lg lg:max-w-xl"
          />
        </div>
      </div>
    </section>
  );
}
