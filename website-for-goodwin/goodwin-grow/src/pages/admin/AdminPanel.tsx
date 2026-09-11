import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Settings, Database, Server, Copy, CheckCircle, AlertCircle, Building, Users as UsersIcon, Shield, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { createClient } from '@supabase/supabase-js';

// Create a secondary client for admin operations so we don't log out the current admin session
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key';
const adminAuthClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export const AdminPanel = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [pingData, setPingData] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // User Management State
  const [users, setUsers] = useState<any[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('employee');
  const [isAddingUser, setIsAddingUser] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('app_users').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setUsers(data);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword) return alert("Email and password are required");
    setIsAddingUser(true);

    try {
      // 1. Create auth user using secondary client
      const { data: authData, error: authError } = await adminAuthClient.auth.signUp({
        email: newEmail,
        password: newPassword,
      });

      if (authError) throw authError;

      // 2. Insert role into app_users
      const { error: dbError } = await supabase.from('app_users').insert([{
        email: newEmail,
        role: newRole
      }]);

      if (dbError) throw dbError;

      alert("User added successfully!");
      setNewEmail('');
      setNewPassword('');
      setNewRole('employee');
      fetchUsers();
    } catch (err: any) {
      alert("Failed to add user: " + err.message);
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleDeleteUser = async (id: string, email: string) => {
    if (!window.confirm(`Are you sure you want to remove access for ${email}?`)) return;
    try {
      const { error } = await supabase.from('app_users').delete().eq('id', id);
      if (error) throw error;
      fetchUsers();
      alert('User removed from access list. (Note: Auth account still exists in Supabase dashboard)');
    } catch (err: any) {
      alert('Failed to remove user: ' + err.message);
    }
  };

  const testConnection = async () => {
    setIsTesting(true);
    setConnectionStatus('idle');
    try {
      const { error } = await supabase.from('employees').select('id').limit(1);
      if (error && error.code !== '42P01') throw error;
      
      setConnectionStatus('success');
      setPingData(`Connected successfully at ${new Date().toLocaleTimeString()}`);
    } catch (err: any) {
      setConnectionStatus('error');
      setPingData(`Error: ${err.message || 'Failed to connect'}`);
    } finally {
      setIsTesting(false);
    }
  };

  const copySchema = () => {
    const schemaText = `-- Goodwin Grow AI ERP - Supabase SQL Schema
-- (Refer to scratch/rbac_schema.sql for the RBAC tables)`;
    navigator.clipboard.writeText(schemaText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-secondary-dark rounded-lg">
          <Settings className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-display text-secondary-dark tracking-tight">System Admin</h1>
          <p className="text-secondary-light">Configure database connections and system settings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UsersIcon className="h-5 w-5 mr-2 text-primary" />
              Role-Based User Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add User Form */}
            <form onSubmit={handleAddUser} className="bg-canvas-variant/30 p-4 rounded-lg border border-canvas-variant space-y-4">
              <h3 className="text-sm font-semibold text-secondary-dark flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Provision New User Access
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <Input type="email" placeholder="Email Address" value={newEmail} onChange={e => setNewEmail(e.target.value)} required />
                </div>
                <div className="md:col-span-1">
                  <Input type="password" placeholder="Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                </div>
                <div className="md:col-span-1">
                  <Select 
                    value={newRole} 
                    onChange={e => setNewRole(e.target.value)}
                    options={[
                      {value: 'employee', label: 'Employee'},
                      {value: 'admin', label: 'Admin'}
                    ]}
                  />
                </div>
                <div className="md:col-span-1">
                  <Button type="submit" className="w-full" disabled={isAddingUser}>
                    <Plus className="h-4 w-4 mr-2" />
                    {isAddingUser ? 'Adding...' : 'Add User'}
                  </Button>
                </div>
              </div>
            </form>

            {/* Users List */}
            <div className="border border-canvas-variant rounded-md overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-canvas text-secondary-light font-medium uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-canvas-variant">
                  {users.map(u => (
                    <tr key={u.id} className="bg-canvas-surface hover:bg-canvas-variant/50">
                      <td className="px-4 py-3 font-medium text-secondary-dark">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${u.role === 'admin' ? 'bg-primary/10 text-primary-dark' : 'bg-secondary/10 text-secondary-dark'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDeleteUser(u.id, u.email)} className="p-1 text-danger hover:bg-danger/10 rounded">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-secondary-light">No users found. Are you sure app_users table is created?</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Supabase Connection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2 text-primary" />
              Supabase Cloud DB Connection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="enterprise-label">Project URL</label>
                <Input value={supabaseUrl} readOnly className="bg-canvas/50 font-mono text-xs" />
              </div>
              <div className="space-y-2">
                <label className="enterprise-label">Anon (Public) Key</label>
                <Input type="password" value={supabaseKey} readOnly className="bg-canvas/50 font-mono text-xs" />
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-canvas-variant">
              <Button onClick={testConnection} disabled={isTesting}>
                <Server className="h-4 w-4 mr-2" />
                {isTesting ? 'Pinging...' : 'Test Connection'}
              </Button>
            </div>

            {connectionStatus !== 'idle' && (
              <div className={`p-4 rounded-md flex items-start ${
                connectionStatus === 'success' ? 'bg-primary/10 text-primary-dark border border-primary/20' : 'bg-danger/10 text-danger border border-danger/20'
              }`}>
                {connectionStatus === 'success' ? (
                  <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-semibold text-sm">
                    {connectionStatus === 'success' ? 'Connection Successful' : 'Connection Failed'}
                  </h4>
                  <p className="text-xs mt-1 font-mono">{pingData}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
