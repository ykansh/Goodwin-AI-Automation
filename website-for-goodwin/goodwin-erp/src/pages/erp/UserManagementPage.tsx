import { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Key, Users, Plus, Save, AlertOctagon, Trash2 } from 'lucide-react';
import { getAdminClient } from '../../lib/supabaseAdmin';
import { useAuth } from '../../store/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';
import type { UserRole } from '../../types';

export function UserManagementPage() {
  const { user } = useAuth();
  const [serviceKey, setServiceKey] = useState(localStorage.getItem('goodwin_admin_key') || '');
  const [isConfigured, setIsConfigured] = useState(!!serviceKey);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const [usersList, setUsersList] = useState<any[]>([]);
  const [rolesMap, setRolesMap] = useState<Record<string, UserRole>>({});
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // New User Form
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('employee');
  const [newFullName, setNewFullName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Verify and Save Service Key
  const handleSaveKey = async () => {
    if (!serviceKey) return toast.error('Key is required');
    setIsConnecting(true);
    try {
      const adminClient = getAdminClient(serviceKey);
      if (!adminClient) throw new Error('Client creation failed');
      
      // Test the key by trying to list users
      const { error } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1 });
      
      if (error) throw error;
      
      localStorage.setItem('goodwin_admin_key', serviceKey);
      setIsConfigured(true);
      toast.success('Admin access configured successfully!');
      fetchUsers(adminClient);
    } catch (err: any) {
      toast.error(err.message || 'Invalid Service Role Key');
      localStorage.removeItem('goodwin_admin_key');
      setIsConfigured(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleClearKey = () => {
    localStorage.removeItem('goodwin_admin_key');
    setServiceKey('');
    setIsConfigured(false);
    setUsersList([]);
  };

  const fetchUsers = async (adminClient: any) => {
    setIsLoadingUsers(true);
    try {
      // 1. Fetch auth users
      const { data: authData, error: authErr } = await adminClient.auth.admin.listUsers();
      if (authErr) throw authErr;
      
      // 2. Fetch roles
      const { data: roleData, error: roleErr } = await supabase.from('user_roles').select('*');
      if (roleErr) throw roleErr;

      const rMap: Record<string, UserRole> = {};
      if (roleData) {
        roleData.forEach((r: any) => {
          rMap[r.user_id] = r.role as UserRole;
        });
      }
      setRolesMap(rMap);
      setUsersList(authData.users || []);
    } catch (err: any) {
      toast.error('Failed to fetch users: ' + err.message);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (isConfigured && serviceKey) {
      const adminClient = getAdminClient(serviceKey);
      if (adminClient) fetchUsers(adminClient);
    }
  }, [isConfigured]);

  const handleUpdateRole = async (userId: string, newRoleValue: UserRole) => {
    try {
      const adminClient = getAdminClient(serviceKey);
      if (!adminClient) throw new Error('Not configured');

      // Update in database (user_roles table) using adminClient to bypass RLS
      const { error } = await adminClient
        .from('user_roles')
        .upsert({ user_id: userId, role: newRoleValue }, { onConflict: 'user_id' });
      
      if (error) throw error;
      
      // Update local state
      setRolesMap(prev => ({ ...prev, [userId]: newRoleValue }));
      toast.success('Role updated successfully');
    } catch (err: any) {
      toast.error('Failed to update role: ' + err.message);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword) return toast.error('Email and password required');
    
    setIsCreating(true);
    try {
      const adminClient = getAdminClient(serviceKey);
      if (!adminClient) throw new Error('Not configured');

      // Create auth user without logging out the current admin
      const { data, error } = await adminClient.auth.admin.createUser({
        email: newEmail,
        password: newPassword,
        email_confirm: true,
        user_metadata: { full_name: newFullName }
      });

      if (error) throw error;
      if (!data.user) throw new Error('User creation failed');

      // Insert role using adminClient to bypass RLS
      const { error: roleError } = await adminClient
        .from('user_roles')
        .upsert({ user_id: data.user.id, role: newRole }, { onConflict: 'user_id' });

      if (roleError) throw roleError;

      toast.success(`User ${newEmail} created as ${newRole}!`);
      setShowAddModal(false);
      setNewEmail('');
      setNewPassword('');
      setNewFullName('');
      setNewRole('employee');
      fetchUsers(adminClient);

    } catch (err: any) {
      toast.error('Failed to create user: ' + err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete user ${email}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const adminClient = getAdminClient(serviceKey);
      if (!adminClient) throw new Error('Not configured');

      const { error } = await adminClient.auth.admin.deleteUser(userId);
      if (error) throw error;

      toast.success(`User ${email} deleted successfully`);
      fetchUsers(adminClient);
    } catch (err: any) {
      toast.error('Failed to delete user: ' + err.message);
    }
  };

  // Only allow admin
  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Access Denied</h2>
        <p className="text-gray-500">Only administrators can access User Management.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="glass-strong p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#3a3b39] dark:text-white tracking-tight flex items-center gap-3">
            <Shield className="text-blue-600" />
            User Roles & Access
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Manage system access, create accounts, and assign roles.
          </p>
        </div>

        {isConfigured && (
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add User
            </button>
            <button
              onClick={handleClearKey}
              className="px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer"
            >
              Disconnect Admin
            </button>
          </div>
        )}
      </div>

      {!isConfigured ? (
        <div className="glass-strong p-8 rounded-2xl max-w-xl mx-auto border border-blue-100 dark:border-blue-900/30">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 mx-auto">
            <Key className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-center text-[#3a3b39] dark:text-white mb-2">Admin API Setup Required</h2>
          <p className="text-sm text-gray-500 text-center mb-8">
            To create users without logging out of your active session, you must provide your Supabase <strong>Service Role Key</strong>. This key is stored securely in your browser and never leaves this device.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Service Role Key</label>
              <input
                type="password"
                value={serviceKey}
                onChange={(e) => setServiceKey(e.target.value)}
                placeholder="eyJh..."
                className="w-full px-4 py-3 bg-white dark:bg-[#252825] border border-gray-300 dark:border-[#374137] rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleSaveKey}
              disabled={!serviceKey || isConnecting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isConnecting ? 'Connecting...' : <><Save className="w-4 h-4" /> Connect Admin Client</>}
            </button>
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl flex gap-3 mt-4">
              <AlertOctagon className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-800 dark:text-amber-400">
                You can find this key in your Supabase Dashboard: Project Settings &rarr; API &rarr; <code>service_role</code> secret.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-strong overflow-hidden rounded-2xl border border-gray-200 dark:border-[#2d302d]">
          {isLoadingUsers ? (
            <div className="p-12 text-center text-gray-500">Loading users...</div>
          ) : (
            <table className="data-table min-w-full">
              <thead>
                <tr>
                  <th>User / Email</th>
                  <th>Joined Date</th>
                  <th>Last Sign In</th>
                  <th>Current Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map(u => {
                  const role = rolesMap[u.id] || 'employee';
                  const isSelf = u.id === user?.id;
                  
                  return (
                    <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-[#252825]/50 transition-colors">
                      <td>
                        <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          {u.email}
                          {isSelf && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full ml-2">You</span>}
                        </div>
                      </td>
                      <td className="text-sm text-gray-500">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="text-sm text-gray-500">
                        {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : 'Never'}
                      </td>
                      <td>
                        <select
                          value={role}
                          onChange={(e) => handleUpdateRole(u.id, e.target.value as UserRole)}
                          disabled={isSelf}
                          className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-[#1e211e] border border-gray-300 dark:border-gray-700 rounded-lg outline-none cursor-pointer disabled:opacity-50"
                        >
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="sales">Sales</option>
                          <option value="inventory">Inventory</option>
                          <option value="accounts">Accounts</option>
                          <option value="employee">Employee</option>
                        </select>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u.id, u.email)}
                          disabled={isSelf}
                          className="px-3 py-1.5 bg-red-100/50 hover:bg-red-200 dark:bg-red-900/20 hover:dark:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e211e] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create New User</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Full Name (Optional)</label>
                <input
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-[#252825] border border-gray-200 dark:border-[#374137] rounded-xl text-sm outline-none"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-[#252825] border border-gray-200 dark:border-[#374137] rounded-xl text-sm outline-none"
                  placeholder="employee@goodwin.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Password *</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-[#252825] border border-gray-200 dark:border-[#374137] rounded-xl text-sm outline-none"
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Assign Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-[#252825] border border-gray-200 dark:border-[#374137] rounded-xl text-sm outline-none font-bold"
                >
                  <option value="employee">Employee</option>
                  <option value="sales">Sales</option>
                  <option value="inventory">Inventory</option>
                  <option value="accounts">Accounts</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newEmail || !newPassword}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg cursor-pointer"
                >
                  {isCreating ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
