import React, { useState, useEffect } from "react";
import { 
  X, ShieldAlert, Users, Crown, Zap, Search, Filter, Plus, 
  Edit3, Trash2, CheckCircle2, AlertCircle, Lock, RefreshCw,
  Building2, ChevronRight, FileText, BarChart3, Clock, Key, UserCheck, UserX,
  Sparkles, Save, UserPlus, HardDrive, Eye
} from "lucide-react";
import { UserProfile, PlanType, AccountStatus, UserRole, AdminAuditLog } from "../types";
import { PLAN_CONFIGS, ALL_PLANS, getPlanConfig, calculateEstimatedMRR } from "../data/pricingMaster";
import { 
  fetchAllUsersForAdmin, 
  updateUserByAdmin, 
  deleteUserByAdmin,
  fetchAdminAuditLogs,
  addAdminAuditLog,
  saveOrUpdateUserProfile,
  checkIsSuperAdmin,
  SUPER_ADMIN_EMAILS
} from "../lib/supabase";
import { UnikornLogo } from "./UnikornLogo";

interface SuperAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail?: string;
  onPlanChangedRemotely?: () => void;
}

export function SuperAdminModal({
  isOpen,
  onClose,
  currentUserEmail = "clearfile360@gmail.com",
  onPlanChangedRemotely
}: SuperAdminModalProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"users" | "addUser" | "analytics" | "logs">("users");

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editPlan, setEditPlan] = useState<PlanType>("free");
  const [editStatus, setEditStatus] = useState<AccountStatus>("active");
  const [editRole, setEditRole] = useState<UserRole>("user");
  const [editCustomLimit, setEditCustomLimit] = useState<string>("");
  const [editAdminNotes, setEditAdminNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Add User State
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPlan, setNewPlan] = useState<PlanType>("free");
  const [newCustomLimit, setNewCustomLimit] = useState<string>("5");
  const [newAdminNotes, setNewAdminNotes] = useState("");

  // Inspect User Cases Modal State
  const [inspectingUser, setInspectingUser] = useState<UserProfile | null>(null);

  // Notification Toast
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const fetchedUsers = await fetchAllUsersForAdmin();
      const fetchedLogs = await fetchAdminAuditLogs();
      setUsers(fetchedUsers);
      setAuditLogs(fetchedLogs);
    } catch (e) {
      console.error("Error loading super admin data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAdminData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Enterprise Security Guard: Verifies Super Admin email array or custom claims
  const isAuthorizedSuperAdmin = checkIsSuperAdmin(currentUserEmail);

  if (!isAuthorizedSuperAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
        <div className="relative w-full max-w-md bg-slate-900 border border-rose-500/30 rounded-3xl p-6 shadow-2xl text-center space-y-4">
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-full w-16 h-16 mx-auto flex items-center justify-center text-rose-400">
            <Lock className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white font-display">அனுமதி மறுக்கப்பட்டது (Access Denied)</h3>
            <p className="text-xs text-rose-300 font-bold mt-1">Super Admin Privileges Required</p>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              சூப்பர் அட்மின் நிர்வாக கட்டுப்பாட்டு மையம் <span className="text-amber-300 font-bold font-mono">clearfile360@gmail.com</span> கணக்கிற்கு மட்டுமே பிரத்யேகமாக அனுமதிக்கப்பட்டுள்ளது.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            மூடு (Close)
          </button>
        </div>
      </div>
    );
  }

  // Filtered User List
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.displayName && u.displayName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      u.uid.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPlan = selectedPlanFilter === "all" || u.plan === selectedPlanFilter;
    const matchesStatus = selectedStatusFilter === "all" || u.status === selectedStatusFilter;

    return matchesSearch && matchesPlan && matchesStatus;
  });

  // Analytics Metrics
  const totalUsersCount = users.length;
  const proEnterpriseCount = users.filter((u) => u.plan !== "free").length;
  const totalCasesCount = users.reduce((acc, curr) => acc + (curr.caseCount || 1), 0);
  const estimatedMRR = calculateEstimatedMRR(users);

  // Quick Plan Change Handler directly from dropdown row
  const handleQuickPlanChange = async (targetUser: UserProfile, newPlanVal: PlanType) => {
    try {
      await updateUserByAdmin(
        targetUser.uid,
        { plan: newPlanVal },
        currentUserEmail
      );
      
      setUsers((prev) =>
        prev.map((u) => (u.uid === targetUser.uid ? { ...u, plan: newPlanVal } : u))
      );

      showToast(`கட்டண திட்டம் மாற்றப்பட்டது: ${targetUser.email} ➔ ${newPlanVal.toUpperCase()}`);
      
      if (onPlanChangedRemotely) {
        onPlanChangedRemotely();
      }
    } catch (err) {
      showToast("திட்டம் மாற்றத்தில் தவறு ஏற்பட்டது.");
    }
  };

  // Quick Status Toggle Handler
  const handleQuickStatusToggle = async (targetUser: UserProfile) => {
    const nextStatus: AccountStatus = 
      targetUser.status === "active" ? "suspended" : 
      targetUser.status === "suspended" ? "vip" : "active";

    try {
      await updateUserByAdmin(
        targetUser.uid,
        { status: nextStatus },
        currentUserEmail
      );

      setUsers((prev) =>
        prev.map((u) => (u.uid === targetUser.uid ? { ...u, status: nextStatus } : u))
      );

      showToast(`கணக்கு நிலை மாற்றப்பட்டது: ${targetUser.email} ➔ ${nextStatus.toUpperCase()}`);
    } catch (err) {
      showToast("கணக்கு நிலை மாற்றத்தில் தவறு ஏற்பட்டது.");
    }
  };

  // Open Edit User Modal
  const openEditModal = (user: UserProfile) => {
    setEditingUser(user);
    setEditPlan(user.plan);
    setEditStatus(user.status);
    setEditRole(user.role || "user");
    setEditCustomLimit(user.customCaseLimit !== undefined ? String(user.customCaseLimit) : "");
    setEditAdminNotes(user.adminNotes || "");
  };

  // Save Edit User Changes
  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSaving(true);
    try {
      const parsedLimit = editCustomLimit.trim() ? parseInt(editCustomLimit, 10) : undefined;
      const updates: Partial<UserProfile> = {
        plan: editPlan,
        status: editStatus,
        role: editRole,
        customCaseLimit: isNaN(parsedLimit as number) ? undefined : parsedLimit,
        adminNotes: editAdminNotes
      };

      await updateUserByAdmin(editingUser.uid, updates, currentUserEmail);

      setUsers((prev) =>
        prev.map((u) => (u.uid === editingUser.uid ? { ...u, ...updates } : u))
      );

      showToast(`பயனாளர் ${editingUser.email} விவரங்கள் சேமிக்கப்பட்டன!`);
      setEditingUser(null);

      if (onPlanChangedRemotely) {
        onPlanChangedRemotely();
      }
    } catch (err) {
      showToast("சேமிப்பில் தவறு ஏற்பட்டது.");
    } finally {
      setIsSaving(false);
    }
  };

  // Add New User Form Handler
  const handleAddNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      showToast("மின்னஞ்சல் முகவரியை உள்ளிடவும்!");
      return;
    }

    setIsSaving(true);
    try {
      const generatedUid = `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const parsedLimit = newCustomLimit.trim() ? parseInt(newCustomLimit, 10) : 5;

      const newUser: UserProfile = {
        uid: generatedUid,
        email: newEmail.trim().toLowerCase(),
        displayName: newName.trim() || newEmail.split("@")[0],
        photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${generatedUid}&backgroundColor=6366f1`,
        plan: newPlan,
        status: "active",
        role: "user",
        customCaseLimit: parsedLimit,
        adminNotes: newAdminNotes,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        caseCount: 0
      };

      await saveOrUpdateUserProfile({
        uid: newUser.uid,
        email: newUser.email,
        displayName: newUser.displayName,
        photoURL: newUser.photoURL
      }, newPlan);

      await updateUserByAdmin(newUser.uid, {
        customCaseLimit: parsedLimit,
        adminNotes: newAdminNotes
      }, currentUserEmail);

      setUsers((prev) => [newUser, ...prev]);
      
      // Log audit
      await addAdminAuditLog({
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        adminEmail: currentUserEmail,
        action: "ADD_NEW_USER",
        targetUserEmail: newUser.email,
        details: `Created user with plan ${newPlan} and custom limit ${parsedLimit}`
      });

      showToast(`புதிய பயனாளர் கணக்கு உருவாக்கப்பட்டது: ${newUser.email}`);
      setNewEmail("");
      setNewName("");
      setNewPlan("free");
      setNewCustomLimit("5");
      setNewAdminNotes("");
      setActiveTab("users");
    } catch (err) {
      showToast("புதிய பயனாளர் உருவாக்கத்தில் தவறு ஏற்பட்டது.");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete User Handler
  const handleDeleteUser = async (targetUser: UserProfile) => {
    if (!window.confirm(`நிச்சயமாக பயனாளர் கணக்கை (${targetUser.email}) நீக்க விரும்புகிறீர்களா?`)) {
      return;
    }

    try {
      await deleteUserByAdmin(targetUser.uid, currentUserEmail);
      setUsers((prev) => prev.filter((u) => u.uid !== targetUser.uid));
      showToast(`பயனாளர் ${targetUser.email} நீக்கப்பட்டார்.`);
    } catch (err) {
      showToast("பயனாளர் நீக்குதலில் தவறு ஏற்பட்டது.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
        
        {/* Toast Notification */}
        {notification && (
          <div className="absolute top-4 right-4 z-50 bg-emerald-950 border border-emerald-500 text-emerald-200 text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{notification}</span>
          </div>
        )}

        {/* Modal Top Header Bar */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-5 sm:p-6 border-b border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <UnikornLogo size="lg" showText={false} />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase tracking-wider rounded border border-amber-400/40 flex items-center gap-1">
                  <ShieldAlert className="h-3 w-3 text-amber-400" />
                  சூப்பர் அட்மின் நிர்வாக மையம் (Super Admin Control Panel)
                </span>
                <span className="text-[10px] text-slate-400 font-mono font-bold">UNIKORN360 v2.0</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white font-display tracking-tight flex items-center gap-2">
                பயனாளர் கணக்குகள் & திட்டங்கள் கட்டுப்பாடு
              </h2>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 self-end md:self-auto">
            <button
              onClick={loadAdminData}
              disabled={isLoading}
              title="தரவுகளை புதுப்பிக்க (Refresh Data)"
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-indigo-400" : ""}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2.5 bg-slate-800 hover:bg-rose-950/80 hover:text-rose-300 text-slate-400 rounded-xl border border-slate-700 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Metrics Overview Ribbon */}
        <div className="bg-slate-950/80 px-6 py-3.5 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">மொத்த பயனாளர்கள்</p>
              <p className="text-base font-black text-white font-mono mt-0.5">{totalUsersCount} Accounts</p>
            </div>
            <Users className="h-5 w-5 text-indigo-400" />
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pro & Enterprise</p>
              <p className="text-base font-black text-amber-400 font-mono mt-0.5">{proEnterpriseCount} Subscribers</p>
            </div>
            <Crown className="h-5 w-5 text-amber-400" />
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">மொத்த நில வழக்குகள்</p>
              <p className="text-base font-black text-emerald-400 font-mono mt-0.5">{totalCasesCount} Cases</p>
            </div>
            <FileText className="h-5 w-5 text-emerald-400" />
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">மதிப்பிடப்பட்ட MRR</p>
              <p className="text-base font-black text-indigo-300 font-mono mt-0.5">₹{estimatedMRR.toLocaleString("en-IN")}/மா</p>
            </div>
            <Zap className="h-5 w-5 text-indigo-400" />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-900 border-b border-slate-800 px-6 pt-3 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "users"
                ? "bg-slate-950 text-amber-300 border-t-2 border-amber-400 border-x border-slate-800"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>பயனாளர்கள் பட்டியல் ({filteredUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("addUser")}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "addUser"
                ? "bg-slate-950 text-emerald-300 border-t-2 border-emerald-400 border-x border-slate-800"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <UserPlus className="h-4 w-4" />
            <span>+ புதிய பயனாளர் சேர்</span>
          </button>

          <button
            onClick={() => setActiveTab("logs")}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "logs"
                ? "bg-slate-950 text-indigo-300 border-t-2 border-indigo-400 border-x border-slate-800"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>நிர்வாக மாற்றங்கள் பதிவு (Audit Log)</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 bg-slate-950 space-y-6">
          
          {/* TAB 1: USERS LIST & SEARCH */}
          {activeTab === "users" && (
            <div className="space-y-4">
              
              {/* Filter Controls Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
                {/* Search Input */}
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="மின்னஞ்சல் அல்லது பெயர் தேடுக..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Filter className="h-3.5 w-3.5 text-slate-400" />
                    <span>திட்டம்:</span>
                  </div>
                  <select
                    value={selectedPlanFilter}
                    onChange={(e) => setSelectedPlanFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 font-bold focus:border-amber-400 focus:outline-none cursor-pointer"
                  >
                    <option value="all">அனைத்து திட்டங்கள்</option>
                    {ALL_PLANS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.adminLabel}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedStatusFilter}
                    onChange={(e) => setSelectedStatusFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 font-bold focus:border-amber-400 focus:outline-none cursor-pointer"
                  >
                    <option value="all">அனைத்து நிலைகள்</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="vip">VIP Pass</option>
                  </select>
                </div>
              </div>

              {/* Users Table / List */}
              {isLoading ? (
                <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-3">
                  <RefreshCw className="h-8 w-8 text-amber-400 animate-spin" />
                  <p className="text-xs font-bold">பயனாளர் தரவுகள் ஏற்றப்படுகின்றன...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl p-6">
                  <UserX className="h-10 w-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-300">பயனாளர்கள் எவரும் கிடைக்கவில்லை</p>
                  <p className="text-xs text-slate-500 mt-1">தேடல் அல்லது வடிகட்டி விருப்பங்களை மாற்றி மீண்டும் முயற்சிக்கவும்.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-900/60 shadow-xl">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-black tracking-wider text-[10px]">
                      <tr>
                        <th className="px-4 py-3.5">பயனாளர் விவரம்</th>
                        <th className="px-4 py-3.5">திட்டம் (Subscription Plan)</th>
                        <th className="px-4 py-3.5">கணக்கு நிலை (Status)</th>
                        <th className="px-4 py-3.5 text-center">வழக்குகள் பயன்பாடு</th>
                        <th className="px-4 py-3.5 text-right">நிர்வாக நடவடிக்கைகள்</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredUsers.map((u) => {
                        const isSuperAdminUser = u.email.toLowerCase() === "clearfile360@gmail.com" || u.role === "superadmin";

                        return (
                          <tr key={u.uid} className="hover:bg-slate-800/40 transition-colors">
                            {/* User details */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-3">
                                <img
                                  src={u.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${u.uid}`}
                                  alt={u.email}
                                  className="h-9 w-9 rounded-full border border-slate-700 object-cover shrink-0"
                                />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-white truncate max-w-[200px]">
                                      {u.displayName || u.email.split("@")[0]}
                                    </span>
                                    {isSuperAdminUser && (
                                      <span className="px-1.5 py-0.2 bg-amber-400/20 text-amber-300 text-[9px] font-black rounded border border-amber-400/30">
                                        SUPER ADMIN
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-slate-400 block truncate max-w-[220px]">
                                    {u.email}
                                  </span>
                                  {u.adminNotes && (
                                    <span className="text-[10px] text-amber-300/80 italic block truncate max-w-[220px]">
                                      Note: {u.adminNotes}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Plan Selector */}
                            <td className="px-4 py-3.5">
                              <select
                                value={u.plan}
                                onChange={(e) => handleQuickPlanChange(u, e.target.value as PlanType)}
                                className={`px-2.5 py-1 rounded-xl text-xs font-black border cursor-pointer focus:outline-none transition-all ${
                                  u.plan === "enterprise"
                                    ? "bg-purple-950/80 text-purple-300 border-purple-600/60"
                                    : u.plan === "advocate"
                                    ? "bg-amber-950/80 text-amber-300 border-amber-600/60"
                                    : u.plan === "pro"
                                    ? "bg-indigo-950/80 text-indigo-300 border-indigo-600/60"
                                    : "bg-slate-950 text-slate-300 border-slate-700"
                                }`}
                              >
                                {ALL_PLANS.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.adminLabel}
                                  </option>
                                ))}
                              </select>
                            </td>

                            {/* Account Status Toggle */}
                            <td className="px-4 py-3.5">
                              <button
                                onClick={() => handleQuickStatusToggle(u)}
                                title="நிலையை மாற்ற சொடுக்கவும் (Click to toggle status)"
                                className={`px-2.5 py-1 rounded-xl text-[11px] font-black border flex items-center gap-1.5 cursor-pointer transition-all ${
                                  u.status === "active"
                                    ? "bg-emerald-950/80 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900/80"
                                    : u.status === "suspended"
                                    ? "bg-rose-950/80 text-rose-300 border-rose-700/60 hover:bg-rose-900/80"
                                    : "bg-indigo-950/80 text-indigo-300 border-indigo-700/60 hover:bg-indigo-900/80"
                                }`}
                              >
                                {u.status === "active" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                                {u.status === "suspended" && <UserX className="h-3.5 w-3.5 text-rose-400" />}
                                {u.status === "vip" && <Crown className="h-3.5 w-3.5 text-indigo-400" />}
                                <span className="uppercase">{u.status}</span>
                              </button>
                            </td>

                            {/* Case Count & Custom Limit */}
                            <td className="px-4 py-3.5 text-center">
                              <div className="inline-flex flex-col items-center">
                                <span className="font-mono font-bold text-white text-xs">
                                  {u.caseCount || 0} வழக்குகள்
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {u.customCaseLimit !== undefined
                                    ? `வரம்பு: ${u.customCaseLimit}`
                                    : getPlanConfig(u.plan).maxCases > 10000
                                    ? "வரம்பு: வரம்பற்றது"
                                    : `வரம்பு: ${getPlanConfig(u.plan).maxCases}`}
                                </span>
                              </div>
                            </td>

                            {/* Action Buttons */}
                            <td className="px-4 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => openEditModal(u)}
                                  title="கணக்கு மாற்றங்கள் (Edit Limits & Notes)"
                                  className="p-1.5 bg-slate-800 hover:bg-amber-950/80 hover:text-amber-300 border border-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                  <span className="hidden lg:inline">திருத்து</span>
                                </button>

                                <button
                                  onClick={() => setInspectingUser(u)}
                                  title="பயனாளர் வழக்குகளை காண்க (Inspect User Cases)"
                                  className="p-1.5 bg-slate-800 hover:bg-indigo-950/80 hover:text-indigo-300 border border-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  <span className="hidden lg:inline">வழக்குகள்</span>
                                </button>

                                {!isSuperAdminUser && (
                                  <button
                                    onClick={() => handleDeleteUser(u)}
                                    title="கணக்கை நீக்கு (Delete User)"
                                    className="p-1.5 bg-slate-800 hover:bg-rose-950 hover:text-rose-300 border border-slate-700 text-slate-400 rounded-lg text-xs transition-all cursor-pointer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ADD NEW USER */}
          {activeTab === "addUser" && (
            <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400">
                  <UserPlus className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white font-display">புதிய பயனாளர் கணக்கு உருவாக்குதல்</h3>
                  <p className="text-xs text-slate-400">Super Admin மூலம் நேரடியாக புதிய கணக்கை அனுமதித்தல் & திட்டம் நிர்ணயித்தல்</p>
                </div>
              </div>

              <form onSubmit={handleAddNewUser} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">மின்னஞ்சல் முகவரி (User Email) *</label>
                  <input
                    type="email"
                    required
                    placeholder="எ.கா: advocate.chennai@gmail.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">பயனாளர் பெயர் (Display Name)</label>
                  <input
                    type="text"
                    placeholder="எ.கா: Advocate Senthil Kumar"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">அளிக்கும் திட்டம் (Subscription Plan)</label>
                    <select
                      value={newPlan}
                      onChange={(e) => setNewPlan(e.target.value as PlanType)}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 font-bold focus:border-emerald-400 focus:outline-none cursor-pointer"
                    >
                      {ALL_PLANS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.adminLabel} ({p.nameTamil})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">சிறப்பு வழக்கு வரம்பு (Custom Case Limit)</label>
                    <input
                      type="number"
                      placeholder="எ.கா: 10 அல்லது 9999"
                      value={newCustomLimit}
                      onChange={(e) => setNewCustomLimit(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white font-mono rounded-xl px-3.5 py-2.5 focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">நிர்வாக குறிப்பு (Admin Internal Notes)</label>
                  <textarea
                    rows={2}
                    placeholder="எ.கா: சென்னை உயர்நீதிமன்ற வழக்கறிஞருக்கான சிறப்பு கணக்கு அனுமதி"
                    value={newAdminNotes}
                    onChange={(e) => setNewAdminNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 focus:border-emerald-400 focus:outline-none resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    <span>கணக்கு உருவாக்கு & அனுமதியை சேமி</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: AUDIT LOGS */}
          {activeTab === "logs" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white font-display">நிர்வாக நடவடிக்கைகள் பதிவு வரலாறு (Super Admin Audit Trail)</h3>
                <span className="text-[11px] text-slate-400 font-mono">மொத்தம்: {auditLogs.length} பதிவுகள்</span>
              </div>

              {auditLogs.length === 0 ? (
                <div className="py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                  <Clock className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-bold">நிர்வாக மாற்றங்கள் இன்னும் பதிவாகவில்லை.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400 shrink-0">
                          <Key className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{log.action}</span>
                            <span className="text-[10px] text-amber-400 font-mono">by {log.adminEmail}</span>
                          </div>
                          <p className="text-slate-300 text-[11px] mt-0.5">{log.details}</p>
                          <span className="text-[10px] text-slate-500 block">இலக்கு: {log.targetUserEmail}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono self-end sm:self-auto shrink-0">
                        {new Date(log.timestamp).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* EDIT USER DRAWER / MODAL OVERLAY */}
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Edit3 className="h-5 w-5 text-amber-400" />
                  <h3 className="text-base font-black text-white font-display">பயனாளர் கணக்கு திருத்தம்</h3>
                </div>
                <button
                  onClick={() => setEditingUser(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center gap-3">
                <img
                  src={editingUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${editingUser.uid}`}
                  alt=""
                  className="h-10 w-10 rounded-full border border-slate-700 object-cover shrink-0"
                />
                <div className="min-w-0 text-xs">
                  <span className="font-bold text-white block truncate">{editingUser.displayName || editingUser.email}</span>
                  <span className="text-slate-400 font-mono truncate block">{editingUser.email}</span>
                  <span className="text-[10px] text-slate-500 font-mono block">UID: {editingUser.uid}</span>
                </div>
              </div>

              <form onSubmit={handleSaveEditUser} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">திட்டம் (Subscription Plan)</label>
                  <select
                    value={editPlan}
                    onChange={(e) => setEditPlan(e.target.value as PlanType)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 font-bold focus:border-amber-400 focus:outline-none cursor-pointer"
                  >
                    {ALL_PLANS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.adminLabel} ({p.nameTamil})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">கணக்கு நிலை (Status)</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as AccountStatus)}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 font-bold focus:border-amber-400 focus:outline-none cursor-pointer"
                    >
                      <option value="active">Active (செயலில்)</option>
                      <option value="suspended">Suspended (முடக்கம்)</option>
                      <option value="vip">VIP Pass (சிறப்பு அனுமதி)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">பங்கு (Enterprise RBAC Role)</label>
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value as UserRole)}
                      className="w-full bg-slate-950 border border-slate-800 text-amber-300 rounded-xl px-3.5 py-2.5 font-bold focus:border-amber-400 focus:outline-none cursor-pointer"
                    >
                      <option value="user">User (சாதாரண பயனாளர்)</option>
                      <option value="advocate">Advocate / Legal Counsel (வழக்கறிஞர்)</option>
                      <option value="district_admin">District Admin (மாவட்ட நிர்வாகி)</option>
                      <option value="vao">VAO / Village Admin Officer (கிராம நிர்வாக அலுவலர்)</option>
                      <option value="surveyor">Surveyor (நில அளவையாளர்)</option>
                      <option value="auditor">Auditor / Compliance (தணிக்கையாளர்)</option>
                      <option value="client">Client / Property Owner (சொத்து உரிமையாளர்)</option>
                      <option value="admin">Admin (நிர்வாகி)</option>
                      <option value="superadmin">Super Admin (சூப்பர் அட்மின்)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">சிறப்பு வழக்கு வரம்பு (Custom Case Limit Override)</label>
                  <input
                    type="number"
                    placeholder="வெறுமையாக விட்டால் திட்ட வரம்பு அமலாகும்"
                    value={editCustomLimit}
                    onChange={(e) => setEditCustomLimit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white font-mono rounded-xl px-3.5 py-2.5 focus:border-amber-400 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">குறிப்பிட்ட பயனாளருக்கு அதிக வழக்குகள் வழங்க எண்களை உள்ளிடவும் (எ.கா: 20 அல்லது 9999).</p>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">அட்மின் குறிப்பு (Admin Internal Note)</label>
                  <textarea
                    rows={2}
                    placeholder="குறிப்புகள் எ.கா: சென்னை வழக்கறிஞர் கோரிக்கைப்படி சிறப்பு சலுகை அளிக்கப்பட்டது."
                    value={editAdminNotes}
                    onChange={(e) => setEditAdminNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 focus:border-amber-400 focus:outline-none resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                  >
                    ரத்து செய்
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
                  >
                    {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    <span>மாற்றங்களை சேமி</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* INSPECT USER CASES OVERLAY */}
        {inspectingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Eye className="h-5 w-5 text-indigo-400" />
                  <div>
                    <h3 className="text-base font-black text-white font-display">பயனாளர் நில வழக்குகள் ஆய்வு</h3>
                    <p className="text-xs text-slate-400">{inspectingUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setInspectingUser(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1 text-xs">
                <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300">வழக்கு #101: சர்வே எண் 142/2A பட்டா மேல்முறையீடு</span>
                    <span className="text-[10px] text-slate-500 font-mono">மதுரை கிழக்கு</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">உடமை மாறுதல் மற்றும் பட்டா மாறுதல் உத்தரவை எதிர்த்து வருவாய் கோட்டாட்சியர் (RDO) முன் தாக்கல்.</p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300">வழக்கு #102: நஞ்சை நிலம் எல்லை அளவீடு கோரிக்கை</span>
                    <span className="text-[10px] text-slate-500 font-mono">கோவை</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">தாசில்தார் அலுவலகத்தில் அளவீட்டு கட்டணம் செலுத்தியும் அளக்கப்படாததால் மனு.</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setInspectingUser(null)}
                  className="px-5 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700"
                >
                  மூடு
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
