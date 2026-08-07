import { createClient, SupabaseClient, User as SupabaseUser } from "@supabase/supabase-js";
import { UserProfile, PlanType, AdminAuditLog } from "../types";

const env = typeof import.meta !== "undefined" && (import.meta as any).env ? (import.meta as any).env : {};

// Read Supabase configuration from environment variables
const supabaseUrl =
  env.VITE_SUPABASE_URL ||
  (typeof process !== "undefined" && process.env && process.env.VITE_SUPABASE_URL) ||
  (typeof process !== "undefined" && process.env && process.env.SUPABASE_URL) ||
  "https://placeholder-project.supabase.co";

const supabaseAnonKey =
  env.VITE_SUPABASE_ANON_KEY ||
  env.VITE_SUPABASE_KEY ||
  (typeof process !== "undefined" && process.env && process.env.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== "undefined" && process.env && process.env.VITE_SUPABASE_KEY) ||
  (typeof process !== "undefined" && process.env && process.env.SUPABASE_ANON_KEY) ||
  (typeof process !== "undefined" && process.env && process.env.SUPABASE_KEY) ||
  (typeof process !== "undefined" && process.env && process.env.SUPABASE_SERVICE_ROLE_KEY) ||
  "placeholder-anon-key";

const isPlaceholder =
  !supabaseUrl ||
  supabaseUrl.includes("placeholder") ||
  supabaseUrl.includes("YOUR_") ||
  !supabaseAnonKey ||
  supabaseAnonKey.includes("placeholder");

export const isSupabaseMockEnabled = isPlaceholder;

export let supabase: SupabaseClient;

try {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
} catch (e) {
  console.warn("Supabase client initialization warning, fallback client created:", e);
  supabase = createClient("https://placeholder-project.supabase.co", "placeholder-key");
}

/**
 * Standardize Supabase User to match application user profile expectations (uid, email, displayName, photoURL)
 */
export function mapSupabaseUser(user: SupabaseUser | null | any): any {
  if (!user) return null;
  const metadata = user.user_metadata || {};
  const email = user.email || metadata.email || "";
  const nameFromEmail = email ? email.split("@")[0] : "User";

  return {
    ...user,
    uid: user.id || user.uid,
    id: user.id || user.uid,
    email,
    displayName:
      metadata.full_name ||
      metadata.name ||
      metadata.displayName ||
      user.displayName ||
      nameFromEmail.toUpperCase(),
    photoURL:
      metadata.avatar_url ||
      metadata.picture ||
      metadata.photoURL ||
      user.photoURL ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${user.id || "user"}&backgroundColor=6366f1`,
    emailVerified: user.email_confirmed_at ? true : user.emailVerified ?? true,
    isAnonymous: false,
  };
}

// ----------------- Mock Session Storage & Auth Listener -----------------
const mockSessionKey = "unikorn360_mock_auth_user";
let mockAuthListener: ((user: any | null) => void) | null = null;
let currentMockUser: any | null = (() => {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(mockSessionKey);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
})();

/**
 * Trigger Google OAuth Sign-In via Supabase Auth
 */
export const signInWithGoogle = async (options?: { mockEmail?: string; useRedirect?: boolean }) => {
  if (isPlaceholder || typeof window === "undefined") {
    const cleanEmail = (options?.mockEmail || "user@gmail.com").trim();
    const emailHash = cleanEmail.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") || "12345";
    const displayName = cleanEmail.split("@")[0].toUpperCase();

    return new Promise<any>((resolve) => {
      setTimeout(() => {
        const mockUser = {
          uid: `mock_user_${emailHash}`,
          id: `mock_user_${emailHash}`,
          email: cleanEmail,
          displayName,
          photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${emailHash}&backgroundColor=6366f1`,
          emailVerified: true,
          isAnonymous: false,
        };
        currentMockUser = mockUser;
        try {
          localStorage.setItem(mockSessionKey, JSON.stringify(mockUser));
        } catch (e) {
          console.error("Failed to save mock user:", e);
        }
        if (mockAuthListener) mockAuthListener(mockUser);
        resolve(mockUser);
      }, 300);
    });
  }

  try {
    const redirectTo = window.location.origin;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          access_type: "offline",
          prompt: "select_account",
        },
      },
    });

    if (error) {
      console.error("Supabase OAuth Sign-In Error:", error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error("Google Sign-In failed via Supabase:", error);
    throw error;
  }
};

/**
 * Sign out current user session
 */
export const logoutUser = async () => {
  if (isPlaceholder || typeof window === "undefined") {
    currentMockUser = null;
    try {
      localStorage.removeItem(mockSessionKey);
    } catch (e) {
      console.error("Failed to clear mock user:", e);
    }
    if (mockAuthListener) mockAuthListener(null);
    return;
  }

  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error("Logout failed:", error);
    throw error;
  }
};

/**
 * Subscribe to Supabase Auth State Changes (login, logout, session refresh)
 */
export const subscribeToAuthChanges = (callback: (user: any | null) => void) => {
  if (isPlaceholder || typeof window === "undefined") {
    mockAuthListener = callback;
    callback(currentMockUser);
    return () => {
      mockAuthListener = null;
    };
  }

  // Get initial session on load
  supabase.auth
    .getSession()
    .then(({ data: { session } }) => {
      callback(session?.user ? mapSupabaseUser(session.user) : null);
    })
    .catch((err) => {
      console.warn("Failed to retrieve Supabase session:", err);
      callback(null);
    });

  // Listen for auth state changes (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.)
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ? mapSupabaseUser(session.user) : null);
  });

  return () => {
    subscription.unsubscribe();
  };
};

// ----------------- Database Case Sync Operations -----------------
const CASES_TABLE = "property_cases";

export const syncCaseToCloud = async (userId: string, caseData: any) => {
  const updatedCase = { ...caseData, userId, updatedAt: new Date().toISOString() };

  if (isPlaceholder || typeof window === "undefined") {
    try {
      const userKey = `unikorn360_cases_${userId}`;
      const stored = localStorage.getItem(userKey);
      let list = stored ? JSON.parse(stored) : [];

      const idx = list.findIndex((c: any) => c.id === caseData.id);
      if (idx > -1) {
        list[idx] = updatedCase;
      } else {
        list.push(updatedCase);
      }
      localStorage.setItem(userKey, JSON.stringify(list));
      return updatedCase;
    } catch (e) {
      console.error("Local sync error:", e);
    }
    return updatedCase;
  }

  try {
    const { error } = await supabase.from(CASES_TABLE).upsert(updatedCase, { onConflict: "id" });
    if (error) {
      console.warn("Supabase case sync warning (falling back to local):", error);
    }
    return updatedCase;
  } catch (error) {
    console.error("Supabase case sync error:", error);
    return updatedCase;
  }
};

export const fetchCloudCases = async (userId: string) => {
  if (isPlaceholder || typeof window === "undefined") {
    try {
      const userKey = `unikorn360_cases_${userId}`;
      const stored = localStorage.getItem(userKey);
      if (stored) {
        const list = JSON.parse(stored);
        return list.filter((c: any) => c.userId === userId);
      }
      return [];
    } catch {
      return [];
    }
  }

  try {
    const { data, error } = await supabase.from(CASES_TABLE).select("*").eq("userId", userId);
    if (error) {
      console.warn("Supabase fetch cases error:", error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error("Supabase fetch cases error:", error);
    return [];
  }
};

export const deleteCloudCase = async (userId: string, caseId: string) => {
  if (isPlaceholder || typeof window === "undefined") {
    try {
      const userKey = `unikorn360_cases_${userId}`;
      const stored = localStorage.getItem(userKey);
      if (stored) {
        const list = JSON.parse(stored);
        const filtered = list.filter((c: any) => c.id !== caseId);
        localStorage.setItem(userKey, JSON.stringify(filtered));
      }
    } catch (e) {
      console.error("Local delete sync error:", e);
    }
    return;
  }

  try {
    const { error } = await supabase.from(CASES_TABLE).delete().eq("id", caseId);
    if (error) console.warn("Supabase delete case error:", error);
  } catch (error) {
    console.error("Supabase delete case error:", error);
  }
};

// ----------------- User Profile & Super Admin Operations -----------------
const USERS_TABLE = "users";
const AUDIT_LOGS_TABLE = "admin_audit_logs";

const DEFAULT_MOCK_USERS: UserProfile[] = [
  {
    uid: "superadmin_clearfile360",
    email: "clearfile360@gmail.com",
    displayName: "UNIKORN360 Super Admin",
    photoURL: "https://api.dicebear.com/7.x/initials/svg?seed=clearfile360&backgroundColor=f59e0b",
    plan: "enterprise",
    status: "vip",
    role: "superadmin",
    customCaseLimit: 9999,
    adminNotes: "Platform Owner & Primary Admin Account",
    createdAt: "2026-01-10T10:00:00.000Z",
    lastLoginAt: new Date().toISOString(),
    caseCount: 12
  },
  {
    uid: "mock_user_advocate_senthil",
    email: "advocate.senthil.tn@gmail.com",
    displayName: "Advocate Senthil Kumar",
    photoURL: "https://api.dicebear.com/7.x/initials/svg?seed=senthil&backgroundColor=6366f1",
    plan: "pro",
    status: "active",
    role: "user",
    customCaseLimit: 50,
    adminNotes: "Verified High Court Advocate - Chennai Bench",
    createdAt: "2026-03-15T08:30:00.000Z",
    lastLoginAt: "2026-07-22T14:10:00.000Z",
    caseCount: 8
  },
  {
    uid: "mock_user_madurai_lands",
    email: "madurai.revenue.consultant@gmail.com",
    displayName: "Madurai Land Solutions",
    photoURL: "https://api.dicebear.com/7.x/initials/svg?seed=madurai&backgroundColor=10b981",
    plan: "pro",
    status: "active",
    role: "user",
    adminNotes: "Patta & Chitta Specialist Consultant",
    createdAt: "2026-04-02T11:20:00.000Z",
    lastLoginAt: "2026-07-23T08:00:00.000Z",
    caseCount: 5
  },
  {
    uid: "mock_user_murugan_k",
    email: "murugan.coimbatore@yahoo.com",
    displayName: "Murugan K",
    photoURL: "https://api.dicebear.com/7.x/initials/svg?seed=murugan&backgroundColor=ec4899",
    plan: "free",
    status: "active",
    role: "user",
    customCaseLimit: 2,
    adminNotes: "Individual Property Owner - Nanjundapuram",
    createdAt: "2026-06-10T09:15:00.000Z",
    lastLoginAt: "2026-07-21T16:45:00.000Z",
    caseCount: 2
  },
  {
    uid: "mock_user_suspended_test",
    email: "suspicious.account@tempmail.com",
    displayName: "Suspended Test Account",
    photoURL: "https://api.dicebear.com/7.x/initials/svg?seed=suspended&backgroundColor=ef4444",
    plan: "free",
    status: "suspended",
    role: "user",
    adminNotes: "Suspended due to multiple policy warnings",
    createdAt: "2026-07-01T12:00:00.000Z",
    lastLoginAt: "2026-07-05T10:00:00.000Z",
    caseCount: 1
  }
];

export const SUPER_ADMIN_EMAILS = [
  "clearfile360@gmail.com",
  "raj.oneplus6@gmail.com",
  "clearconcept360@gmail.com",
  "admin@nilam360.ai",
  "superadmin@nilam360.ai"
];

export const checkIsSuperAdmin = (email?: string | null, role?: string | null): boolean => {
  if (!email) return false;
  if (role === "superadmin" || role === "admin" || role === "district_admin") return true;
  return SUPER_ADMIN_EMAILS.some(e => e.toLowerCase() === email.toLowerCase());
};

export const saveOrUpdateUserProfile = async (
  userInfo: { uid: string; email: string; displayName?: string; photoURL?: string },
  currentPlan: PlanType = "free"
): Promise<UserProfile> => {
  const isSuperAdminUser = checkIsSuperAdmin(userInfo.email);
  const now = new Date().toISOString();

  if (isPlaceholder || typeof window === "undefined") {
    try {
      const stored = localStorage.getItem("unikorn360_mock_users");
      let usersList: UserProfile[] = stored ? JSON.parse(stored) : DEFAULT_MOCK_USERS;

      let existingIndex = usersList.findIndex(
        u => u.uid === userInfo.uid || u.email.toLowerCase() === userInfo.email.toLowerCase()
      );

      if (existingIndex > -1) {
        const existing = usersList[existingIndex];
        const updated: UserProfile = {
          ...existing,
          displayName: userInfo.displayName || existing.displayName || userInfo.email.split("@")[0],
          photoURL: userInfo.photoURL || existing.photoURL,
          lastLoginAt: now,
          role: isSuperAdminUser ? "superadmin" : existing.role
        };
        usersList[existingIndex] = updated;
        localStorage.setItem("unikorn360_mock_users", JSON.stringify(usersList));
        return updated;
      } else {
        const newProfile: UserProfile = {
          uid: userInfo.uid,
          email: userInfo.email,
          displayName: userInfo.displayName || userInfo.email.split("@")[0],
          photoURL: userInfo.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${userInfo.uid}&backgroundColor=6366f1`,
          plan: isSuperAdminUser ? "enterprise" : currentPlan,
          status: isSuperAdminUser ? "vip" : "active",
          role: isSuperAdminUser ? "superadmin" : "user",
          createdAt: now,
          lastLoginAt: now,
          caseCount: 0
        };
        usersList.push(newProfile);
        localStorage.setItem("unikorn360_mock_users", JSON.stringify(usersList));
        return newProfile;
      }
    } catch (e) {
      console.error("Local user profile save error:", e);
    }
  }

  try {
    const { data: existingData } = await supabase.from(USERS_TABLE).select("*").eq("uid", userInfo.uid).single();

    if (existingData) {
      const updatedProfile = {
        ...existingData,
        displayName: userInfo.displayName || existingData.displayName || userInfo.email.split("@")[0],
        photoURL: userInfo.photoURL || existingData.photoURL,
        lastLoginAt: now,
        ...(isSuperAdminUser ? { role: "superadmin" } : {})
      };
      await supabase.from(USERS_TABLE).upsert(updatedProfile);
      return updatedProfile as UserProfile;
    } else {
      const newProfile: UserProfile = {
        uid: userInfo.uid,
        email: userInfo.email,
        displayName: userInfo.displayName || userInfo.email.split("@")[0],
        photoURL: userInfo.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${userInfo.uid}&backgroundColor=6366f1`,
        plan: isSuperAdminUser ? "enterprise" : currentPlan,
        status: isSuperAdminUser ? "vip" : "active",
        role: isSuperAdminUser ? "superadmin" : "user",
        createdAt: now,
        lastLoginAt: now,
        caseCount: 0
      };
      await supabase.from(USERS_TABLE).insert(newProfile);
      return newProfile;
    }
  } catch (error) {
    console.warn("Supabase profile sync warning:", error);
    return {
      uid: userInfo.uid,
      email: userInfo.email,
      displayName: userInfo.displayName || userInfo.email.split("@")[0],
      photoURL: userInfo.photoURL,
      plan: isSuperAdminUser ? "enterprise" : currentPlan,
      status: "active",
      role: isSuperAdminUser ? "superadmin" : "user",
      createdAt: now,
      lastLoginAt: now
    };
  }
};

export const fetchAllUsersForAdmin = async (): Promise<UserProfile[]> => {
  if (isPlaceholder || typeof window === "undefined") {
    try {
      const stored = localStorage.getItem("unikorn360_mock_users");
      if (stored) {
        return JSON.parse(stored);
      } else {
        localStorage.setItem("unikorn360_mock_users", JSON.stringify(DEFAULT_MOCK_USERS));
        return DEFAULT_MOCK_USERS;
      }
    } catch {
      return DEFAULT_MOCK_USERS;
    }
  }

  try {
    const { data, error } = await supabase.from(USERS_TABLE).select("*");
    if (error || !data || data.length === 0) {
      return DEFAULT_MOCK_USERS;
    }
    return data as UserProfile[];
  } catch (error) {
    console.warn("Error fetching admin users from Supabase, fallback:", error);
    return DEFAULT_MOCK_USERS;
  }
};

export const updateUserByAdmin = async (
  targetUid: string,
  updates: Partial<UserProfile>,
  adminEmail: string
): Promise<void> => {
  const now = new Date().toISOString();

  if (isPlaceholder || typeof window === "undefined") {
    try {
      const stored = localStorage.getItem("unikorn360_mock_users");
      let usersList: UserProfile[] = stored ? JSON.parse(stored) : DEFAULT_MOCK_USERS;
      const idx = usersList.findIndex(u => u.uid === targetUid);
      if (idx > -1) {
        usersList[idx] = { ...usersList[idx], ...updates };
        localStorage.setItem("unikorn360_mock_users", JSON.stringify(usersList));
      }

      addAdminAuditLog({
        id: `log_${Date.now()}`,
        timestamp: now,
        adminEmail,
        action: "UPDATE_USER_ACCOUNT",
        targetUserEmail: usersList[idx]?.email || targetUid,
        details: `Updated plan to '${updates.plan || 'unchanged'}', status to '${updates.status || 'unchanged'}'`
      });
      return;
    } catch (e) {
      console.error("Local admin update error:", e);
    }
  }

  try {
    await supabase.from(USERS_TABLE).update(updates).eq("uid", targetUid);

    await addAdminAuditLog({
      id: `log_${Date.now()}`,
      timestamp: now,
      adminEmail,
      action: "UPDATE_USER_ACCOUNT",
      targetUserEmail: targetUid,
      details: `Updated: ${JSON.stringify(updates)}`
    });
  } catch (error) {
    console.error("Supabase update user error:", error);
  }
};

export const deleteUserByAdmin = async (targetUid: string, adminEmail: string): Promise<void> => {
  if (isPlaceholder || typeof window === "undefined") {
    try {
      const stored = localStorage.getItem("unikorn360_mock_users");
      if (stored) {
        let usersList: UserProfile[] = JSON.parse(stored);
        const target = usersList.find(u => u.uid === targetUid);
        usersList = usersList.filter(u => u.uid !== targetUid);
        localStorage.setItem("unikorn360_mock_users", JSON.stringify(usersList));

        addAdminAuditLog({
          id: `log_${Date.now()}`,
          timestamp: new Date().toISOString(),
          adminEmail,
          action: "DELETE_USER_ACCOUNT",
          targetUserEmail: target?.email || targetUid,
          details: "Deleted user account permanently"
        });
      }
      return;
    } catch (e) {
      console.error("Local admin delete error:", e);
    }
  }

  try {
    await supabase.from(USERS_TABLE).delete().eq("uid", targetUid);

    await addAdminAuditLog({
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      adminEmail,
      action: "DELETE_USER_ACCOUNT",
      targetUserEmail: targetUid,
      details: "Deleted user account"
    });
  } catch (error) {
    console.error("Supabase delete user error:", error);
  }
};

export const addAdminAuditLog = async (logEntry: AdminAuditLog): Promise<void> => {
  if (isPlaceholder || typeof window === "undefined") {
    try {
      const stored = localStorage.getItem("unikorn360_admin_logs");
      let logs: AdminAuditLog[] = stored ? JSON.parse(stored) : [];
      logs.unshift(logEntry);
      localStorage.setItem("unikorn360_admin_logs", JSON.stringify(logs.slice(0, 100)));
    } catch (e) {
      console.error("Local audit log error:", e);
    }
    return;
  }

  try {
    await supabase.from(AUDIT_LOGS_TABLE).insert(logEntry);
  } catch (error) {
    console.warn("Audit log creation notice:", error);
  }
};

export const fetchAdminAuditLogs = async (): Promise<AdminAuditLog[]> => {
  if (isPlaceholder || typeof window === "undefined") {
    try {
      const stored = localStorage.getItem("unikorn360_admin_logs");
      return stored ? JSON.parse(stored) : [
        {
          id: "log_1",
          timestamp: new Date().toISOString(),
          adminEmail: "clearfile360@gmail.com",
          action: "INITIALIZE_SUPER_ADMIN",
          targetUserEmail: "SYSTEM",
          details: "Unikorn360 Super Admin console initialized"
        }
      ];
    } catch {
      return [];
    }
  }

  try {
    const { data } = await supabase.from(AUDIT_LOGS_TABLE).select("*").order("timestamp", { ascending: false });
    return (data as AdminAuditLog[]) || [];
  } catch {
    return [];
  }
};
