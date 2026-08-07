import { createClient, SupabaseClient, User as SupabaseUser } from "@supabase/supabase-js";

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
