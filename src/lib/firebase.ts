import { initializeApp, getApp, getApps } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc,
  getDocFromServer
} from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";
import { UserProfile, PlanType, AdminAuditLog } from "../types";

// Dynamic configuration check
const isPlaceholder = !firebaseConfig.apiKey || firebaseConfig.apiKey.includes("FakeKey");

let app: any;
let auth: ReturnType<typeof getAuth>;
let db: ReturnType<typeof getFirestore>;

export { app, auth, db };

// Check if we should run in Mock mode
const useMockFirebase = isPlaceholder || typeof window === "undefined";

if (!useMockFirebase) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");
    
    // Set local persistence for stable session holding
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.warn("Firebase Auth persistence error:", err);
    });

    // Check for incoming redirect sign-in result on page load
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log("Successfully authenticated via Google Redirect:", result.user.email);
        }
      })
      .catch((err) => {
        console.warn("Redirect authentication check notice:", err);
      });
  } catch (err) {
    console.error("Firebase initialization failed, falling back to simulation mode:", err);
  }
}

// Ensure database connection is tested on initial boot
if (!useMockFirebase && db) {
  const testConnection = async () => {
    try {
      await getDocFromServer(doc(db, "test", "connection"));
    } catch (error) {
      if (error instanceof Error && error.message.includes("the client is offline")) {
        console.warn("Please check your Firebase configuration or network status.");
      }
    }
  };
  testConnection();
}

// ----------------- Types -----------------
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

// Firestore Error Handler as mandated by SKILL.md
function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const currentAuth = auth;
  const user = currentAuth ? currentAuth.currentUser : null;
  
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: user?.uid || null,
      email: user?.email || null,
      emailVerified: user?.emailVerified || null,
      isAnonymous: user?.isAnonymous || null,
      tenantId: user?.tenantId || null,
      providerInfo: user?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ----------------- Mock Data Storage & Handlers -----------------
// Enables immediate high-fidelity testing even without active GCP project setup
const mockSessionKey = "unikorn360_mock_auth_user";
let mockAuthListener: ((user: any | null) => void) | null = null;
let currentMockUser: any | null = (() => {
  try {
    const saved = localStorage.getItem(mockSessionKey);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
})();

export const isFirebaseMockEnabled = useMockFirebase;

// ----------------- Exported Authentication Services -----------------
export const signInWithGoogle = async (options?: { mockEmail?: string; useRedirect?: boolean }) => {
  if (useMockFirebase) {
    const cleanEmail = (options?.mockEmail || "user@gmail.com").trim();
    // Generate a simple deterministic UID from the email address
    const emailHash = cleanEmail.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") || "12345";
    const displayName = cleanEmail.split("@")[0].toUpperCase();
    
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        const mockUser = {
          uid: `mock_user_${emailHash}`,
          email: cleanEmail,
          displayName: displayName,
          photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${emailHash}&backgroundColor=6366f1`,
          emailVerified: true,
          isAnonymous: false,
        };
        currentMockUser = mockUser;
        localStorage.setItem(mockSessionKey, JSON.stringify(mockUser));
        if (mockAuthListener) mockAuthListener(mockUser);
        resolve(mockUser);
      }, 300);
    });
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account'
  });

  if (options?.useRedirect) {
    await signInWithRedirect(auth, provider);
    return null;
  }

  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    console.warn("Google signInWithPopup failed or was blocked by browser iframe policies. Attempting redirect fallback...", error);
    if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
      try {
        await signInWithRedirect(auth, provider);
        return null;
      } catch (redirectError) {
        console.error("Google Sign-In redirect fallback failed:", redirectError);
        throw redirectError;
      }
    }
    throw error;
  }
};

export const logoutUser = async () => {
  if (useMockFirebase) {
    currentMockUser = null;
    localStorage.removeItem(mockSessionKey);
    if (mockAuthListener) mockAuthListener(null);
    return;
  }
  
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout failed:", error);
    throw error;
  }
};

export const subscribeToAuthChanges = (callback: (user: any | null) => void) => {
  if (useMockFirebase) {
    mockAuthListener = callback;
    // Immediate callback with current value
    callback(currentMockUser);
    return () => {
      mockAuthListener = null;
    };
  }

  return onAuthStateChanged(auth, callback);
};

// ----------------- Firestore Database Sync Operations -----------------
const CASES_COLLECTION = "property_cases";

/**
 * Uploads/Saves a case to cloud firestore (or simulated DB if mock mode is on)
 */
export const syncCaseToCloud = async (userId: string, caseData: any) => {
  const docPath = `${CASES_COLLECTION}/${caseData.id}`;
  const updatedCase = { ...caseData, userId, updatedAt: new Date().toISOString() };
  
  if (useMockFirebase) {
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
    const docRef = doc(db, CASES_COLLECTION, caseData.id);
    await setDoc(docRef, updatedCase);
    return updatedCase;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
    return updatedCase;
  }
};

/**
 * Loads all cases owned by the current logged-in user
 */
export const fetchCloudCases = async (userId: string) => {
  if (useMockFirebase) {
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
    const q = query(collection(db, CASES_COLLECTION), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const cases: any[] = [];
    querySnapshot.forEach((doc) => {
      cases.push(doc.data());
    });
    return cases;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, CASES_COLLECTION);
    return [];
  }
};

/**
 * Deletes a case from cloud storage
 */
export const deleteCloudCase = async (userId: string, caseId: string) => {
  const docPath = `${CASES_COLLECTION}/${caseId}`;
  
  if (useMockFirebase) {
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
    const docRef = doc(db, CASES_COLLECTION, caseId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
};

// ----------------- User Profile & Super Admin Operations -----------------
const USERS_COLLECTION = "users";
const AUDIT_LOGS_COLLECTION = "admin_audit_logs";

/**
 * Initial sample mock users for high-fidelity testing in local/mock environments
 */
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

/**
 * Saves or updates user profile in Firestore/localStorage
 */
export const saveOrUpdateUserProfile = async (
  userInfo: { uid: string; email: string; displayName?: string; photoURL?: string },
  currentPlan: PlanType = "free"
): Promise<UserProfile> => {
  const isSuperAdminUser = checkIsSuperAdmin(userInfo.email);

  const docPath = `${USERS_COLLECTION}/${userInfo.uid}`;
  const now = new Date().toISOString();

  if (useMockFirebase) {
    try {
      const stored = localStorage.getItem("unikorn360_mock_users");
      let usersList: UserProfile[] = stored ? JSON.parse(stored) : DEFAULT_MOCK_USERS;
      
      let existingIndex = usersList.findIndex(u => u.uid === userInfo.uid || u.email.toLowerCase() === userInfo.email.toLowerCase());
      
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
    const userDocRef = doc(db, USERS_COLLECTION, userInfo.uid);
    const existingSnap = await getDoc(userDocRef);

    if (existingSnap.exists()) {
      const existingData = existingSnap.data() as UserProfile;
      const updatedProfile: Partial<UserProfile> = {
        displayName: userInfo.displayName || existingData.displayName || userInfo.email.split("@")[0],
        photoURL: userInfo.photoURL || existingData.photoURL,
        lastLoginAt: now,
        ...(isSuperAdminUser ? { role: "superadmin" } : {})
      };
      await setDoc(userDocRef, updatedProfile, { merge: true });
      return { ...existingData, ...updatedProfile } as UserProfile;
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
      await setDoc(userDocRef, newProfile);
      return newProfile;
    }
  } catch (error) {
    console.warn("Firestore user profile sync warning (falling back to generated profile):", error);
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

/**
 * Fetches all user profiles for Super Admin dashboard
 */
export const fetchAllUsersForAdmin = async (): Promise<UserProfile[]> => {
  if (useMockFirebase) {
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
    const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
    const users: UserProfile[] = [];
    querySnapshot.forEach((docSnap) => {
      users.push(docSnap.data() as UserProfile);
    });
    
    if (users.length === 0) {
      return DEFAULT_MOCK_USERS;
    }
    return users;
  } catch (error) {
    console.warn("Error fetching admin users from Firestore, using mock fallback list:", error);
    try {
      handleFirestoreError(error, OperationType.LIST, USERS_COLLECTION);
    } catch {
      // return fallback list if error is caught
    }
    return DEFAULT_MOCK_USERS;
  }
};

/**
 * Admin action: Update a user's subscription plan, account status, custom limits, or notes
 */
export const updateUserByAdmin = async (
  targetUid: string,
  updates: Partial<UserProfile>,
  adminEmail: string
): Promise<void> => {
  const now = new Date().toISOString();

  if (useMockFirebase) {
    try {
      const stored = localStorage.getItem("unikorn360_mock_users");
      let usersList: UserProfile[] = stored ? JSON.parse(stored) : DEFAULT_MOCK_USERS;
      const idx = usersList.findIndex(u => u.uid === targetUid);
      if (idx > -1) {
        usersList[idx] = { ...usersList[idx], ...updates };
        localStorage.setItem("unikorn360_mock_users", JSON.stringify(usersList));
      }
      
      // Log audit action locally
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
    const userDocRef = doc(db, USERS_COLLECTION, targetUid);
    await setDoc(userDocRef, updates, { merge: true });
    
    // Log admin audit event
    await addAdminAuditLog({
      id: `log_${Date.now()}`,
      timestamp: now,
      adminEmail,
      action: "UPDATE_USER_ACCOUNT",
      targetUserEmail: targetUid,
      details: `Updated: ${JSON.stringify(updates)}`
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${USERS_COLLECTION}/${targetUid}`);
  }
};

/**
 * Admin action: Delete a user account from the system
 */
export const deleteUserByAdmin = async (targetUid: string, adminEmail: string): Promise<void> => {
  if (useMockFirebase) {
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
    const userDocRef = doc(db, USERS_COLLECTION, targetUid);
    await deleteDoc(userDocRef);
    
    await addAdminAuditLog({
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      adminEmail,
      action: "DELETE_USER_ACCOUNT",
      targetUserEmail: targetUid,
      details: "Deleted user account"
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${USERS_COLLECTION}/${targetUid}`);
  }
};

/**
 * System Audit Log helpers
 */
export const addAdminAuditLog = async (logEntry: AdminAuditLog): Promise<void> => {
  if (useMockFirebase) {
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
    const logRef = doc(db, AUDIT_LOGS_COLLECTION, logEntry.id);
    await setDoc(logRef, logEntry);
  } catch (error) {
    console.warn("Audit log creation notice:", error);
  }
};

export const fetchAdminAuditLogs = async (): Promise<AdminAuditLog[]> => {
  if (useMockFirebase) {
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
    const querySnapshot = await getDocs(collection(db, AUDIT_LOGS_COLLECTION));
    const logs: AdminAuditLog[] = [];
    querySnapshot.forEach((docSnap) => {
      logs.push(docSnap.data() as AdminAuditLog);
    });
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch {
    return [];
  }
};

