import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Space_Grotesk, Manrope } from "next/font/google";
import type { ReactNode } from "react";
import { useState, useEffect, useMemo } from "react";
import Cookies from "js-cookie";
import { getStorage } from "@/lib/demoStorage";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export function Layout({
  children,
  title = "MYhire | Job Portal",
  description = "A modern job portal for candidates and hiring teams with skill-based search, applications, and profiles.",
}: Readonly<LayoutProps>) {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const siteUrl = "https://myhire.dev";

  const canonicalUrl = useMemo(() => {
    const path = typeof globalThis.window === "undefined" ? router.asPath : globalThis.location.pathname;
    const cleanPath = (path ?? "/").split("?")[0];
    return cleanPath === "/" ? siteUrl : `${siteUrl}${cleanPath}`;
  }, [router.asPath, siteUrl]);

  const structuredData = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "MYhire Job Portal",
      url: siteUrl,
      description,
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/?search={query}`,
        "query-input": "required name=query",
      },
    }),
    [description, siteUrl],
  );

  useEffect(() => {
    const storage = getStorage();
    const viewParam = router.query.view as string;
    
    if (viewParam === 'jobseeker' || viewParam === 'employer') {
      // In demo mode, set the role from URL and initialize storage
      storage.setItem('userRole', viewParam);
      storage.setItem('userEmail', `demo-${viewParam}@example.com`);
      storage.setItem('userName', viewParam === 'jobseeker' ? 'Demo Job Seeker' : 'Demo Employer');
      setUserRole(viewParam);
    } else {
      const role = storage.getItem("userRole");
      setUserRole(role);
    }
  }, [router.query.view]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileNavOpen(false);
      }
    };

    globalThis.addEventListener("keydown", handleKeyDown);
    return () => {
      globalThis.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [router.pathname, router.query]);

  const handleSignOut = () => {
    const storage = getStorage();
    storage.removeItem("userRole");
    storage.removeItem("userEmail");
    storage.removeItem("userName");
    
    // Remove cookies
    Cookies.remove("userRole");
    Cookies.remove("userEmail");
    Cookies.remove("userName");
    
    router.push("/auth");
  };

  const handleOpenProfile = (e: React.MouseEvent) => {
    e.preventDefault();
    // Dispatch custom event to open profile modal
    const event = new Event('openProfileModal');
    globalThis.dispatchEvent(event);
  };

  const handleOpenApplications = (e: React.MouseEvent) => {
    e.preventDefault();
    // Dispatch custom event to open applications modal
    const event = new Event('openApplicationsModal');
    globalThis.dispatchEvent(event);
  };

  const sharedNav = (
    <>
      <Link
        href="#jobs"
        className="relative overflow-hidden rounded-lg px-3 py-2 transition hover:text-blue-600 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-blue-500 after:transition-all hover:after:w-full"
        onClick={() => setIsMobileNavOpen(false)}
      >
        {userRole === "employer" ? "Dashboard" : "Jobs"}
      </Link>
      <button
        onClick={(event) => {
          handleOpenProfile(event);
          setIsMobileNavOpen(false);
        }}
        className="relative overflow-hidden rounded-lg px-3 py-2 transition hover:text-blue-600 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-blue-500 after:transition-all hover:after:w-full"
      >
        {userRole === "employer" ? "Company Profile" : "Profile"}
      </button>
      {userRole === "jobseeker" && (
        <button
          onClick={(event) => {
            handleOpenApplications(event);
            setIsMobileNavOpen(false);
          }}
          className="relative overflow-hidden rounded-lg px-3 py-2 transition hover:text-blue-600 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-blue-500 after:transition-all hover:after:w-full"
        >
          My Applications
        </button>
      )}
      <Link
        href="/dashboard"
        className="group relative overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/50"
        onClick={() => setIsMobileNavOpen(false)}
      >
        <span className="relative z-10">Dashboard</span>
        <div className="absolute inset-0 -z-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 transition-opacity group-hover:opacity-100" />
      </Link>
      <button
        onClick={(event) => {
          event.preventDefault();
          handleSignOut();
          setIsMobileNavOpen(false);
        }}
        className="group relative overflow-hidden rounded-full border border-red-200 bg-white/80 px-5 py-2.5 font-semibold text-red-600 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50"
      >
        Sign out
      </button>
    </>
  );

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta
          name="keywords"
          content="jobs, hiring, careers, next.js, portal, resume, applications"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="preconnect" href="https://dummyjson.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>
      <div
        className={`${display.variable} ${body.variable} min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 text-slate-800 antialiased`}
      >
        {/* Enhanced animated background */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute left-10 top-20 h-64 w-64 animate-pulse-glow rounded-full bg-blue-400/20 blur-[120px]" />
          <div className="absolute right-16 top-10 h-72 w-72 animate-pulse-glow rounded-full bg-purple-400/20 blur-[140px]" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-20 left-1/3 h-80 w-80 animate-pulse-glow rounded-full bg-indigo-400/15 blur-[160px]" style={{ animationDelay: '4s' }} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08),_transparent_38%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />
        </div>
        
        {/* Enhanced header with glassmorphism */}
        <header className="sticky top-0 z-30 border-b border-blue-200/50 bg-white/80 backdrop-blur-2xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4 lg:px-8">
            <Link href="/" className="group flex items-center gap-2 sm:gap-3 transition-all hover:scale-105">
              <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 p-0.5 shadow-lg shadow-blue-500/30 transition-all group-hover:shadow-xl group-hover:shadow-blue-500/40">
                <div className="h-full w-full rounded-[10px] sm:rounded-[14px] bg-white flex items-center justify-center">
                  <span className="text-xs sm:text-sm font-bold gradient-text">MY</span>
                </div>
              </div>
              <div className="hidden xs:block">
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.24em] sm:tracking-[0.28em] text-blue-600/70 transition-colors group-hover:text-blue-700">
                  MYhire
                </p>
                <p className="text-sm sm:text-base font-semibold text-slate-800">Job Portal</p>
              </div>
            </Link>
            
            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden rounded-lg border border-blue-200 bg-white p-2 text-slate-800 hover:bg-blue-50 transition-colors"
              aria-expanded={isMobileNavOpen}
              aria-controls="mobile-nav-panel"
              aria-label="Toggle menu"
              onClick={() => setIsMobileNavOpen((prev) => !prev)}
            >
              <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileNavOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            
            <nav className="hidden items-center gap-4 lg:gap-6 text-sm font-medium text-slate-700 md:flex">
              {sharedNav}
            </nav>
          </div>
          {isMobileNavOpen && (
            <div className="md:hidden">
              <div className="fixed inset-0 z-20 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsMobileNavOpen(false)} aria-hidden="true" />
              <div
                id="mobile-nav-panel"
                className="absolute inset-x-0 top-full z-30 origin-top rounded-b-2xl border-b border-blue-200/50 bg-white/98 px-4 pb-6 pt-4 shadow-2xl backdrop-blur-xl animate-slide-down"
              >
                <div className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                  {sharedNav}
                </div>
              </div>
            </div>
          )}
        </header>
        
        <main className="mx-auto flex max-w-7xl flex-col gap-8 sm:gap-12 lg:gap-14 px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
          {children}
        </main>
        
        {/* Enhanced footer */}
        <footer className="relative border-t border-blue-200/50 bg-slate-50/80 backdrop-blur-xl mt-12 sm:mt-16">
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-blue-100/30 to-transparent" />
          <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 shadow-lg shadow-blue-500/30 flex items-center justify-center">
                    <span className="text-sm sm:text-base font-bold text-white">MY</span>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm uppercase tracking-[0.24em] sm:tracking-[0.28em] text-blue-600/70">MYhire</p>
                    <p className="text-base sm:text-lg font-semibold text-slate-800">Job Portal</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 max-w-sm">
                  Modern job marketplace connecting talent with opportunity. Built with Next.js.
                </p>
              </div>
              <div>
                <h3 className="mb-3 sm:mb-4 font-semibold text-slate-800">Quick Links</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li><Link href="/" className="hover:text-blue-600 transition inline-flex items-center gap-1">Browse Jobs</Link></li>
                  <li><button onClick={handleOpenProfile} className="hover:text-blue-600 transition inline-flex items-center gap-1">Create Profile</button></li>
                  <li><Link href="/dashboard" className="hover:text-blue-600 transition inline-flex items-center gap-1">Dashboard</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="mb-3 sm:mb-4 font-semibold text-slate-800">Contact</h3>
                <p className="text-sm text-slate-600">
                  Need help?{" "}
                  <a className="text-blue-600 hover:text-blue-700 transition underline underline-offset-2" href="mailto:hello@myhire.dev">
                    hello@myhire.dev
                  </a>
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    Online
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-8 border-t border-blue-200/50 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-slate-500">
              <p>© {new Date().getFullYear()} MYhire. All rights reserved. Built with ❤️ and Next.js</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
