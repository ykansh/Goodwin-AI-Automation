import { supabase } from './supabase';

export type UserRole = 'ADMIN' | 'EMPLOYEE';

export interface AppUserRecord {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  phone?: string;
  designation?: string;
  is_active: boolean;
  created_at: string;
  created_by?: string;
}

const SALT = ':goodwin_erp_secure_salt_2026';
const STORAGE_KEY = 'gb_system_users';
export const SESSION_KEY = 'gb_auth_session';

/**
 * Hash password with Web Crypto SHA-256
 */
export async function hashPassword(password: string): Promise<string> {
  const text = password + SALT;
  // Browser Web Crypto API or Node crypto
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Simple deterministic fallback for headless environments
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `h_${Math.abs(hash).toString(16)}_${text.length}`;
}

/**
 * Verify password against stored hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computed = await hashPassword(password);
  return computed === hash;
}

/**
 * Default seeded system users with pre-calculated SHA-256 hashes
 * admin123 -> for admin@goodwinbatteries.com
 * emp123   -> for employee@goodwinbatteries.com
 */
export const DEFAULT_USERS: AppUserRecord[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Ansh Chourasiya',
    email: 'admin@goodwinbatteries.com',
    password_hash: '', // will be set dynamically or on init
    role: 'ADMIN',
    phone: '+91 96855 79269',
    designation: 'Managing Director / Owner',
    is_active: true,
    created_at: new Date('2026-01-01').toISOString(),
    created_by: 'System Seed',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Rahul Sharma',
    email: 'employee@goodwinbatteries.com',
    password_hash: '', // will be set dynamically or on init
    role: 'EMPLOYEE',
    phone: '+91 98260 55443',
    designation: 'Sales & Billing Executive',
    is_active: true,
    created_at: new Date('2026-01-01').toISOString(),
    created_by: 'System Seed',
  },
];

let memoryUsers: AppUserRecord[] | null = null;

/**
 * Initialize default user hashes if empty
 */
async function ensureDefaultHashes(): Promise<AppUserRecord[]> {
  const adminHash = await hashPassword('admin123');
  const empHash = await hashPassword('emp123');

  return [
    { ...DEFAULT_USERS[0], password_hash: adminHash },
    { ...DEFAULT_USERS[1], password_hash: empHash },
  ];
}

/**
 * Read cached users from Memory or LocalStorage
 */
export function getLocalUsers(): AppUserRecord[] {
  if (memoryUsers && memoryUsers.length > 0) {
    return memoryUsers;
  }
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryUsers = parsed;
          return parsed;
        }
      }
    } catch {}
  }
  return [];
}

/**
 * Save users to Memory and LocalStorage
 */
export function saveLocalUsers(users: AppUserRecord[]) {
  memoryUsers = [...users];
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    } catch {}
  }
}

/**
 * Fetch all users from Supabase `public.app_users` table with LocalStorage fallback
 */
export async function fetchAllUsers(): Promise<AppUserRecord[]> {
  const defaultWithHashes = await ensureDefaultHashes();

  try {
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      const formatted: AppUserRecord[] = (data as Array<Record<string, unknown>>).map((u) => ({
        id: String(u.id || ''),
        name: String(u.name || ''),
        email: String(u.email || '').toLowerCase().trim(),
        password_hash: String(u.password_hash || ''),
        role: (String(u.role || '').toUpperCase() === 'ADMIN' ? 'ADMIN' : 'EMPLOYEE') as UserRole,
        phone: String(u.phone || ''),
        designation: String(u.designation || (String(u.role || '').toUpperCase() === 'ADMIN' ? 'Administrator' : 'Staff')),
        is_active: u.is_active !== false,
        created_at: String(u.created_at || new Date().toISOString()),
        created_by: String(u.created_by || 'Admin'),
      }));

      // Cache locally for offline/resilience
      saveLocalUsers(formatted);
      return formatted;
    }
  } catch {
    // Supabase query failed, fall back
  }

  // Fallback to local storage or memory
  const local = getLocalUsers();
  if (local.length > 0) {
    return local;
  }

  saveLocalUsers(defaultWithHashes);
  return defaultWithHashes;
}

/**
 * Admin creates a new user with email, password, and role
 */
export async function createUserAccount(params: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  designation?: string;
  createdBy?: string;
}): Promise<{ success: boolean; user?: AppUserRecord; error?: string }> {
  const name = params.name.trim();
  const email = params.email.trim().toLowerCase();
  const password = params.password.trim();
  const role = params.role;

  if (!name) return { success: false, error: 'Full Name is required.' };
  if (!email || !email.includes('@')) return { success: false, error: 'A valid email address is required.' };
  if (!password || password.length < 4) return { success: false, error: 'Password must be at least 4 characters long.' };

  // Check for duplicates
  const existingUsers = await fetchAllUsers();
  const duplicate = existingUsers.find((u) => u.email.toLowerCase() === email);
  if (duplicate) {
    return { success: false, error: `An account with email "${email}" already exists.` };
  }

  const passwordHash = await hashPassword(password);
  const newUserId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `usr-${Date.now()}`;

  const newUserRecord: AppUserRecord = {
    id: newUserId,
    name,
    email,
    password_hash: passwordHash,
    role,
    phone: params.phone?.trim() || '',
    designation: params.designation?.trim() || (role === 'ADMIN' ? 'Administrator' : 'Billing & Operations Staff'),
    is_active: true,
    created_at: new Date().toISOString(),
    created_by: params.createdBy || 'Admin',
  };

  // Attempt to save to Supabase
  try {
    const { error } = await supabase.from('app_users').insert([
      {
        id: newUserRecord.id,
        name: newUserRecord.name,
        email: newUserRecord.email,
        password_hash: newUserRecord.password_hash,
        role: newUserRecord.role,
        phone: newUserRecord.phone,
        designation: newUserRecord.designation,
        is_active: true,
        created_at: newUserRecord.created_at,
        created_by: newUserRecord.created_by,
      },
    ]);

    if (error) {
      console.warn('[authService] Could not insert to Supabase app_users table:', error.message);
    }
  } catch (err) {
    console.warn('[authService] Supabase insert failed, keeping in local storage:', err);
  }

  // Update local storage
  const updatedList = [newUserRecord, ...existingUsers];
  saveLocalUsers(updatedList);

  return { success: true, user: newUserRecord };
}

/**
 * Authenticate credentials against registered accounts
 */
export async function authenticateCredentials(
  email: string,
  password: string
): Promise<{ success: boolean; user?: AppUserRecord; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  if (!cleanEmail) return { success: false, error: 'Please enter your email address.' };
  if (!cleanPassword) return { success: false, error: 'Please enter your password.' };

  const users = await fetchAllUsers();
  const matchedUser = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!matchedUser) {
    return {
      success: false,
      error: `No account found with email "${cleanEmail}". Check for typos or contact your Administrator.`,
    };
  }

  if (!matchedUser.is_active) {
    return {
      success: false,
      error: 'This account has been deactivated. Please contact your company Administrator.',
    };
  }

  const isValid = await verifyPassword(cleanPassword, matchedUser.password_hash);
  if (!isValid) {
    return { success: false, error: 'Incorrect password. Please verify and try again.' };
  }

  return { success: true, user: matchedUser };
}

/**
 * Toggle user active/inactive status
 */
export async function toggleUserStatus(id: string, isActive: boolean): Promise<boolean> {
  const users = await fetchAllUsers();
  const updated = users.map((u) => (u.id === id ? { ...u, is_active: isActive } : u));
  saveLocalUsers(updated);

  try {
    await supabase.from('app_users').update({ is_active: isActive }).eq('id', id);
  } catch {}

  return true;
}

/**
 * Delete user account
 */
export async function deleteUserAccount(id: string): Promise<boolean> {
  const users = await fetchAllUsers();
  const updated = users.filter((u) => u.id !== id);
  saveLocalUsers(updated);

  try {
    await supabase.from('app_users').delete().eq('id', id);
  } catch {}

  return true;
}
