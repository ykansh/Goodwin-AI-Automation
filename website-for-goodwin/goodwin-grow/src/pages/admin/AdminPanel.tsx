import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Settings, Database, Server, Copy, CheckCircle, AlertCircle, Building } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const AdminPanel = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [pingData, setPingData] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'Not configured';
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'Not configured';

  const testConnection = async () => {
    setIsTesting(true);
    setConnectionStatus('idle');
    try {
      // Simple ping to check connection - querying a table or just getting session
      const { error } = await supabase.from('employees').select('id').limit(1);
      
      if (error && error.code !== '42P01') { // 42P01 is relation does not exist, meaning connection works but schema isn't there
        throw error;
      }
      
      setConnectionStatus('success');
      setPingData(`Connected successfully at ${new Date().toLocaleTimeString()}`);
    } catch (err: any) {
      setConnectionStatus('error');
      setPingData(`Error: ${err.message || 'Failed to connect to Supabase'}`);
    } finally {
      setIsTesting(false);
    }
  };

  const copySchema = () => {
    const schemaText = `-- Goodwin Grow AI ERP - Supabase SQL Schema
-- (Refer to supabase/schema.sql in the project root)`;
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
              
              <Button variant="secondary" onClick={copySchema}>
                {copied ? <CheckCircle className="h-4 w-4 mr-2 text-primary" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? 'Copied!' : 'Copy SQL Schema'}
              </Button>
              
              <Button variant="ghost" onClick={() => window.open('https://supabase.com/dashboard', '_blank')}>
                Open SQL Editor
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

        {/* Setup Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-secondary-dark">
              <ol className="list-decimal pl-4 space-y-2">
                <li>Create a new project at <strong>database.supabase.com</strong>.</li>
                <li>Go to Project Settings {'>'} API and copy the <code>Project URL</code> and <code>anon public</code> key.</li>
                <li>Create a <code>.env</code> file in the project root and add:
                  <pre className="bg-secondary-dark text-canvas-surface p-3 rounded-md mt-2 mb-2 text-xs">
                    VITE_SUPABASE_URL=your-url-here<br/>
                    VITE_SUPABASE_ANON_KEY=your-key-here
                  </pre>
                </li>
                <li>Click <strong>Copy SQL Schema</strong> above.</li>
                <li>Click <strong>Open SQL Editor</strong>, paste the schema, and run it to create the database tables.</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Company Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2 text-secondary-light" />
              Company Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <p className="text-xs text-secondary-light font-semibold uppercase tracking-wider">Company Name</p>
                  <p className="text-lg font-display text-secondary-dark mt-1">Choitram</p>
               </div>
               <div>
                  <p className="text-xs text-secondary-light font-semibold uppercase tracking-wider">Location</p>
                  <p className="text-lg font-display text-secondary-dark mt-1">Indore</p>
               </div>
               <div className="col-span-2">
                  <p className="text-xs text-secondary-light font-semibold uppercase tracking-wider">System</p>
                  <p className="text-sm text-secondary-dark mt-1">Goodwin Grow AI ERP - Production Ready v1.0</p>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
