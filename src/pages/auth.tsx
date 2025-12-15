import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { motion } from "framer-motion";
import { Space_Grotesk, Manrope } from "next/font/google";
import { getStorage } from "@/lib/demoStorage";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

type UserRole = "jobseeker" | "employer" | null;
type AuthMode = "signin" | "signup";

interface UserAccount {
  name: string;
  email: string;
  role: Exclude<UserRole, null>;
  password: string;
}

export default function AuthPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<AuthMode>("signup");
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Load existing accounts from localStorage
  const getAccounts = (): UserAccount[] => {
    try {
      const storage = getStorage();
      const stored = storage.getItem("userAccounts");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveAccount = (account: UserAccount) => {
    const storage = getStorage();
    const accounts = getAccounts();
    accounts.push(account);
    storage.setItem("userAccounts", JSON.stringify(accounts));
  };

  const findAccount = (email: string, password: string, role: UserRole): UserAccount | null => {
    const accounts = getAccounts();
    return accounts.find(
      (acc) => acc.email === email && acc.password === password && acc.role === role
    ) || null;
  };

  const handleContinue = () => {
    setError("");
    
    if (!selectedRole || !email || !password) {
      setError("Please fill all required fields");
      return;
    }

    if (authMode === "signup") {
      if (!name) {
        setError("Please enter your name");
        return;
      }

      // Check if account already exists
      const accounts = getAccounts();
      const exists = accounts.find(
        (acc) => acc.email === email && acc.role === selectedRole
      );
      
      if (exists) {
        setError(`An account with this email already exists for ${selectedRole}. Please sign in instead.`);
        return;
      }

      // Create new account
      const newAccount: UserAccount = {
        name,
        email,
        password,
        role: selectedRole,
      };
      
      saveAccount(newAccount);
      
      // Set current session
      const storage = getStorage();
      storage.setItem("userRole", selectedRole);
      storage.setItem("userName", name);
      storage.setItem("userEmail", email);
      
      // Redirect
      router.push("/");
    } else {
      // Sign In
      const account = findAccount(email, password, selectedRole);
      
      if (!account) {
        setError("Invalid credentials. Please check your email, password, and role.");
        return;
      }

      // Set current session
      const storage = getStorage();
      storage.setItem("userRole", account.role);
      storage.setItem("userName", account.name);
      storage.setItem("userEmail", account.email);
      
      // Redirect
      router.push("/");
    }
  };

  return (
    <>
      <Head>
        <title>Welcome to MYhire | Choose Your Path</title>
        <meta name="description" content="Join MYhire as an employer or job seeker" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className={`${display.variable} ${body.variable} min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 px-2 antialiased sm:px-4`}>
        {/* Animated background elements */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute left-10 top-20 h-96 w-96 animate-pulse-glow rounded-full bg-blue-300/20 blur-[120px]" />
          <div className="absolute right-16 bottom-20 h-96 w-96 animate-pulse-glow rounded-full bg-purple-300/20 blur-[140px]" style={{ animationDelay: '2s' }} />
          <div className="absolute left-1/2 top-1/2 h-96 w-96 animate-pulse-glow rounded-full bg-teal-300/15 blur-[160px]" style={{ animationDelay: '4s' }} />
        </div>

        <div className="relative flex min-h-screen items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-5xl"
          >
            {/* Logo and Welcome */}
            <div className="mb-12 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl shadow-blue-500/30"
              >
                <span className="text-3xl font-bold text-white">M</span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-4 text-5xl font-bold text-slate-800 sm:text-6xl"
              >
                {authMode === "signup" ? "Welcome to" : "Welcome back to"}{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">MYhire</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-slate-600"
              >
                {authMode === "signup" ? "Create your account to get started" : "Sign in to your account"}
              </motion.p>

              {/* Auth Mode Toggle */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 flex items-center justify-center gap-2"
              >
                <span className="text-sm text-slate-600">
                  {authMode === "signup" ? "Already have an account?" : "Don’t have an account?"}
                </span>
                <button
                  onClick={() => {
                    setAuthMode(authMode === "signup" ? "signin" : "signup");
                    setError("");
                  }}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  {authMode === "signup" ? "Sign In" : "Sign Up"}
                </button>
              </motion.div>
            </div>

            {/* Role Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <h2 className="mb-6 text-center text-2xl font-semibold text-slate-700">
                {authMode === "signup" ? "Who are you?" : "Sign in as"}
              </h2>
              
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                {/* Job Seeker Card */}
                <motion.button
                  whileHover={{ y: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedRole("jobseeker")}
                  className={`group relative overflow-hidden rounded-3xl p-8 text-left transition-all ${
                    selectedRole === "jobseeker"
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-2xl shadow-blue-500/40"
                      : "bg-white/80 shadow-xl shadow-slate-200/50 backdrop-blur-sm hover:shadow-2xl"
                  }`}
                >
                  <div className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl ${
                    selectedRole === "jobseeker" 
                      ? "bg-white/20" 
                      : "bg-gradient-to-br from-blue-100 to-blue-200"
                  }`}>
                    <svg className={`h-8 w-8 ${selectedRole === "jobseeker" ? "text-white" : "text-blue-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  
                  <h3 className={`mb-3 text-2xl font-bold ${
                    selectedRole === "jobseeker" ? "text-white" : "text-slate-800"
                  }`}>
                    I’m looking for a job
                  </h3>
                  
                  <p className={`mb-4 ${
                    selectedRole === "jobseeker" ? "text-blue-50" : "text-slate-600"
                  }`}>
                    Build your profile, upload resume, and apply for jobs
                  </p>
                  
                  <ul className={`space-y-2 text-sm ${
                    selectedRole === "jobseeker" ? "text-blue-100" : "text-slate-500"
                  }`}>
                    <li className="flex items-center gap-2">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Build profile and upload resume
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Search jobs by skills
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Quick application process
                    </li>
                  </ul>
                  
                  {selectedRole === "jobseeker" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-6 top-6"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                        <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </motion.div>
                  )}
                </motion.button>

                {/* Employer Card */}
                <motion.button
                  whileHover={{ y: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedRole("employer")}
                  className={`group relative overflow-hidden rounded-3xl p-8 text-left transition-all ${
                    selectedRole === "employer"
                      ? "bg-gradient-to-br from-purple-500 to-purple-600 shadow-2xl shadow-purple-500/40"
                      : "bg-white/80 shadow-xl shadow-slate-200/50 backdrop-blur-sm hover:shadow-2xl"
                  }`}
                >
                  <div className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl ${
                    selectedRole === "employer" 
                      ? "bg-white/20" 
                      : "bg-gradient-to-br from-purple-100 to-purple-200"
                  }`}>
                    <svg className={`h-8 w-8 ${selectedRole === "employer" ? "text-white" : "text-purple-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  
                  <h3 className={`mb-3 text-2xl font-bold ${
                    selectedRole === "employer" ? "text-white" : "text-slate-800"
                  }`}>
                    Employer
                  </h3>
                  
                  <p className={`mb-4 ${
                    selectedRole === "employer" ? "text-purple-50" : "text-slate-600"
                  }`}>
                    Post jobs and review applications
                  </p>
                  
                  <ul className={`space-y-2 text-sm ${
                    selectedRole === "employer" ? "text-purple-100" : "text-slate-500"
                  }`}>
                    <li className="flex items-center gap-2">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Post job listings
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Manage applications
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Select candidates
                    </li>
                  </ul>
                  
                  {selectedRole === "employer" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-6 top-6"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                        <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </motion.div>
                  )}
                </motion.button>
              </div>
            </motion.div>

            {/* Form - shown after role selection */}
            {selectedRole && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto max-w-2xl rounded-3xl bg-white/80 p-8 shadow-xl shadow-slate-200/50 backdrop-blur-sm"
              >
                <h3 className="mb-6 text-xl font-semibold text-slate-800">
                  {authMode === "signup" ? "Tell us about yourself" : "Enter your credentials"}
                </h3>
                
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                  >
                    {error}
                  </motion.div>
                )}
                
                <div className="space-y-4">
                  {authMode === "signup" && (
                    <div>
                      <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder:text-slate-400 transition-all focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
                      />
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder:text-slate-400 transition-all focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder:text-slate-400 transition-all focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                  
                  <button
                    onClick={handleContinue}
                    disabled={(authMode === "signup" && !name) || !email || !password}
                    className={`group relative mt-6 w-full overflow-hidden rounded-xl px-6 py-4 text-lg font-semibold text-white shadow-lg transition-all ${
                      selectedRole === "employer"
                        ? "bg-gradient-to-r from-purple-500 to-purple-600 shadow-purple-500/40 hover:shadow-xl hover:shadow-purple-500/50 disabled:from-slate-300 disabled:to-slate-400"
                        : "bg-gradient-to-r from-blue-500 to-blue-600 shadow-blue-500/40 hover:shadow-xl hover:shadow-blue-500/50 disabled:from-slate-300 disabled:to-slate-400"
                    } hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {authMode === "signup" ? "Create Account" : "Sign In"}
                      <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}
