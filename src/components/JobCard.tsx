import { motion } from "framer-motion";
import type { Job } from "@/types";

interface JobCardProps {
  job: Job;
  onApply: (job: Job) => void;
}

export function JobCard({ job, onApply }: JobCardProps) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="group relative flex flex-col gap-3 overflow-hidden rounded-xl border border-blue-200/50 bg-white p-4 shadow-lg shadow-blue-500/10 backdrop-blur transition-all hover:border-blue-400/50 hover:shadow-2xl hover:shadow-blue-500/20 sm:gap-4 sm:rounded-2xl sm:p-5 md:p-6">
      {/* Gradient overlay on hover */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute right-0 top-0 h-32 w-32 bg-gradient-to-bl from-blue-500/10 to-transparent" />
      </div>
      
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
              {job.company}
            </p>
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
          </div>
          <h3 className="mb-2 text-lg font-bold text-slate-800 transition-colors group-hover:text-blue-700 sm:text-xl md:text-2xl">
            {job.title}
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700 sm:text-sm">
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {job.location}
            </span>
            <span className="text-slate-400">•</span>
            <span>{job.type}</span>
            <span className="text-slate-500">•</span>
            <span>{job.mode ?? "Flexible"}</span>
          </div>
        </div>
        <div className="flex flex-row items-center gap-3 sm:flex-col sm:items-end sm:text-right">
          <p className="text-xs text-slate-600">{new Date(job.createdAt).toLocaleDateString()}</p>
          {job.salary && (
            <p className="rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-700 sm:text-sm">
              {job.salary}
            </p>
          )}
        </div>
      </div>
      
      <p className="relative line-clamp-3 text-sm text-slate-700 sm:text-base">{job.description}</p>
      
      <div className="relative flex flex-wrap gap-2">
        {job.skills.map((skill) => (
          <span
            key={skill}
            className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-700 backdrop-blur-sm transition-all hover:border-blue-400/40 hover:bg-blue-500/20"
          >
            {skill}
          </span>
        ))}
      </div>
      
      <div className="relative mt-auto flex flex-col gap-3 border-t border-blue-200/50 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Experience: <span className="font-medium text-slate-700">{job.experience}</span>
        </div>
        <button
          type="button"
          onClick={() => onApply(job)}
          className="group/btn relative overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/50"
        >
          <span className="relative z-10 flex items-center gap-2">
            Apply
            <svg className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
          <div className="absolute inset-0 -z-0 bg-gradient-to-r from-blue-500 to-blue-400 opacity-0 transition-opacity group-hover/btn:opacity-100" />
        </button>
      </div>
    </motion.article>
  );
}
