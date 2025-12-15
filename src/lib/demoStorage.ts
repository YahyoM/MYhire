/**
 * Demo Storage Manager
 * Provides isolated localStorage for different roles in demo mode
 * Allows multiple roles to work simultaneously in different tabs
 */

export class DemoStorage {
  private rolePrefix: string;
  private isDemoMode: boolean;

  constructor(role: 'jobseeker' | 'employer' | null, isDemoMode: boolean) {
    this.isDemoMode = isDemoMode;
    this.rolePrefix = isDemoMode && role ? `demo_${role}_` : '';
  }

  getItem(key: string): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.rolePrefix + key);
  }

  setItem(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.rolePrefix + key, value);
  }

  removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.rolePrefix + key);
  }

  clear(): void {
    if (typeof window === 'undefined') return;
    if (this.isDemoMode) {
      // Only clear items with this role's prefix
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.rolePrefix)) {
          localStorage.removeItem(key);
        }
      });
    } else {
      localStorage.clear();
    }
  }
}

/**
 * Get the appropriate storage manager based on URL parameters
 */
export function getStorage(): DemoStorage {
  if (typeof window === 'undefined') {
    return new DemoStorage(null, false);
  }

  const urlParams = new URLSearchParams(window.location.search);
  const viewParam = urlParams.get('view') as 'jobseeker' | 'employer' | null;
  
  if (viewParam === 'jobseeker' || viewParam === 'employer') {
    return new DemoStorage(viewParam, true);
  }

  return new DemoStorage(null, false);
}

/**
 * Get current role from storage or URL
 */
export function getCurrentRole(): string | null {
  const storage = getStorage();
  return storage.getItem('userRole');
}

/**
 * Get current user email from storage
 */
export function getCurrentEmail(): string | null {
  const storage = getStorage();
  return storage.getItem('userEmail');
}

/**
 * Check if demo mode is active
 */
export function isDemoModeActive(): boolean {
  if (typeof window === 'undefined') return false;
  const urlParams = new URLSearchParams(window.location.search);
  const viewParam = urlParams.get('view');
  return viewParam === 'jobseeker' || viewParam === 'employer';
}
