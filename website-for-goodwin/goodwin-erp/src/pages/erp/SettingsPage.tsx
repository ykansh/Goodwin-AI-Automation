import { useState, useEffect } from 'react';
import { useData } from '../../store/DataContext';
import { createClient } from '@supabase/supabase-js';
import { checkSupabaseConnection, isSupabaseConfigured } from '../../lib/supabaseClient';
import { GOODWIN_SUPABASE_SQL } from '../../lib/supabaseSql';
import { Database, Battery, Building2, Copy, Check, RefreshCw, Wifi, WifiOff, ExternalLink, Code } from 'lucide-react';
import toast from 'react-hot-toast';

export function SettingsPage() {
  const { settings, updateSettings, resetToDummyData } = useData();

  // ── Cloud DB state ─────────────────────────────────────────────────────────
  const [supabaseUrl,  setSupabaseUrl]  = useState(
    import.meta.env.VITE_SUPABASE_URL ?? settings.supabase_url ?? ''
  );
  const [supabaseKey,  setSupabaseKey]  = useState(
    import.meta.env.VITE_SUPABASE_ANON_KEY ?? settings.supabase_anon_key ?? ''
  );
  const [testingDb,    setTestingDb]    = useState(false);
  const [dbStatus,     setDbStatus]     = useState<'idle' | 'checking' | 'connected' | 'error'>(
    isSupabaseConfigured ? 'checking' : 'idle'
  );
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [showKey,      setShowKey]      = useState(false);
  const [showSqlCode,  setShowSqlCode]  = useState(false);

  // ── Battery configs state ──────────────────────────────────────────────────
  const [voltages,     setVoltages]     = useState(settings.battery_configs.voltages.join(', '));
  const [ahRatings,    setAhRatings]    = useState(settings.battery_configs.ah_ratings.join(', '));
  const [warehouses,   setWarehouses]   = useState(settings.battery_configs.warehouses.join('\n'));
  const [salespersons, setSalespersons] = useState(settings.battery_configs.salespersons.join(', '));

  // ── Auto-check connection on mount ─────────────────────────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    setDbStatus('checking');
    checkSupabaseConnection().then((ok) => setDbStatus(ok ? 'connected' : 'error'));
  }, []);

  // ── Test Connection ────────────────────────────────────────────────────────
  const handleTestConnection = async () => {
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      toast.error('Please enter a Supabase URL and Anon Key first.');
      return;
    }
    setTestingDb(true);
    setDbStatus('checking');
    try {
      const testClient = createClient(supabaseUrl.trim(), supabaseKey.trim());
      const { error } = await testClient.from('customers').select('id').limit(1);
      if (!error || error.message.includes('does not exist') || error.code === 'PGRST116') {
        setDbStatus('connected');
        toast.success('✅ Supabase connection verified! API endpoint reachable.');
      } else {
        setDbStatus('error');
        toast.error(`Connection failed: ${error.message}`);
      }
    } catch (err: unknown) {
      setDbStatus('error');
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Connection error: ${msg}`);
    } finally {
      setTestingDb(false);
    }
  };

  // ── Ping current status ───────────────────────────────────────────────────
  const handleCheckGlobalConnection = async () => {
    setDbStatus('checking');
    const ok = await checkSupabaseConnection();
    setDbStatus(ok ? 'connected' : 'error');
    if (ok) toast.success('✅ Cloud DB is connected and healthy!');
    else     toast.error('❌ Cannot reach Supabase. Check your API credentials.');
  };

  // ── Copy SQL schema (Instant bundled string) ──────────────────────────────
  const handleCopySchema = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(GOODWIN_SUPABASE_SQL);
      } else {
        // Fallback for non-HTTPS or iframe security contexts
        const textarea = document.createElement('textarea');
        textarea.value = GOODWIN_SUPABASE_SQL;
        textarea.style.position = 'fixed';
        textarea.style.left = '-999999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedSchema(true);
      toast.success('✅ Supabase SQL Schema copied to clipboard!');
      setTimeout(() => setCopiedSchema(false), 3000);
    } catch {
      // Fallback: toggle code view so user can manual select-all & copy
      setShowSqlCode(true);
      toast.success('SQL code opened below — select and copy!');
    }
  };

  // ── Save battery config ────────────────────────────────────────────────────
  const handleSaveConfigs = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      supabase_url: supabaseUrl.trim(),
      supabase_anon_key: supabaseKey.trim(),
      battery_configs: {
        ...settings.battery_configs,
        voltages:     voltages.split(',').map((s) => s.trim()).filter(Boolean),
        ah_ratings:   ahRatings.split(',').map((s) => s.trim()).filter(Boolean),
        warehouses:   warehouses.split('\n').map((s) => s.trim()).filter(Boolean),
        salespersons: salespersons.split(',').map((s) => s.trim()).filter(Boolean),
      },
    });
  };

  // ── Status badge helper ────────────────────────────────────────────────────
  const statusConfig = {
    idle:      { label: 'Not Configured',  classes: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' },
    checking:  { label: 'Checking...',     classes: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
    connected: { label: '✅ Connected',    classes: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400' },
    error:     { label: '❌ Disconnected', classes: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' },
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="glass-strong p-6 sm:p-8 rounded-3xl border border-white/60 dark:border-white/10
                      flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-[#3a3b39] dark:text-white tracking-tight leading-tight">
            Settings & Cloud DB
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
            Configure Supabase cloud database, battery parameters, warehouse racks & salesperson assignments
          </p>
        </div>
        <button
          type="button"
          onClick={resetToDummyData}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-200/80 hover:bg-gray-300
                     dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200
                     text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          Reset Demo Data
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT: Supabase Cloud DB Panel */}
        <div className="lg:col-span-6 space-y-6">

          {/* Cloud DB Connection Card */}
          <div className="glass-strong p-6 sm:p-8 rounded-3xl border border-white/60 dark:border-white/10 shadow-sm space-y-6">
            {/* Card Header */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-gray-200/60 dark:border-white/10">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-[#00a631] shrink-0" />
                <h2 className="text-base font-black text-[#3a3b39] dark:text-white leading-snug">
                  Supabase Cloud DB Connection
                </h2>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${statusConfig[dbStatus].classes}`}>
                {statusConfig[dbStatus].label}
              </span>
            </div>

            {/* Status indicator row */}
            <div className="glass rounded-2xl p-4 border border-white/50 dark:border-white/10 flex items-center gap-3">
              {dbStatus === 'connected' ? (
                <Wifi className="w-5 h-5 text-[#00a631] shrink-0" />
              ) : (
                <WifiOff className="w-5 h-5 text-gray-400 shrink-0" />
              )}
              <div className="space-y-0.5 min-w-0">
                <p className="text-xs font-extrabold text-[#3a3b39] dark:text-white leading-normal truncate">
                  {isSupabaseConfigured
                    ? 'Supabase configured via .env — Real-time sync active'
                    : 'Running in local/offline mode — data saved to browser'}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-normal truncate">
                  Project: <span className="font-mono">fyxqyylclamwigvdzjem.supabase.co</span>
                </p>
              </div>
              <button
                type="button"
                onClick={handleCheckGlobalConnection}
                className="ml-auto px-3 py-1.5 bg-[#00a631]/10 hover:bg-[#00a631]/20 text-[#00a631]
                           text-xs font-extrabold rounded-xl cursor-pointer transition-all shrink-0"
              >
                Ping
              </button>
            </div>

            {/* Credentials Inputs */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300 leading-normal block">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  className="w-full glass-input px-4 py-2.5 text-xs font-mono font-bold"
                  spellCheck={false}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300 leading-normal block">
                  Supabase Anon (Public) Key
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full glass-input px-4 py-2.5 text-xs font-mono font-bold pr-16"
                    spellCheck={false}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-2.5 text-[10px] font-bold text-gray-500 hover:text-[#00a631] cursor-pointer"
                  >
                    {showKey ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingDb}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#3a3b39] hover:bg-black
                           dark:bg-gray-700 dark:hover:bg-gray-600 text-[#cde06c]
                           text-xs font-extrabold rounded-xl transition-all cursor-pointer disabled:opacity-60"
              >
                {testingDb ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> Testing...</>
                ) : (
                  <><Wifi className="w-4 h-4" /> Test Connection</>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopySchema}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#00a631] hover:bg-[#008a29]
                           text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer"
              >
                {copiedSchema ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedSchema ? 'Copied SQL!' : 'Copy SQL Schema'}
              </button>

              <button
                type="button"
                onClick={() => setShowSqlCode(!showSqlCode)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-200/80 hover:bg-gray-300
                           dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200
                           text-xs font-extrabold rounded-xl transition-all cursor-pointer"
              >
                <Code className="w-4 h-4" />
                {showSqlCode ? 'Hide Code' : 'View Code'}
              </button>

              <a
                href="https://supabase.com/dashboard/project/fyxqyylclamwigvdzjem/editor"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600/10 hover:bg-blue-600/20
                           text-blue-700 dark:text-blue-400 text-xs font-extrabold rounded-xl
                           transition-all cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                Open SQL Editor
              </a>
            </div>

            {/* View SQL Code Panel (Accordion) */}
            {showSqlCode && (
              <div className="glass rounded-2xl p-4 border border-white/60 dark:border-white/10 space-y-2 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#3a3b39] dark:text-white">
                    SQL Schema Code (Click text to select all)
                  </span>
                  <button
                    type="button"
                    onClick={handleCopySchema}
                    className="text-[11px] font-extrabold text-[#00a631] hover:underline cursor-pointer"
                  >
                    Copy All
                  </button>
                </div>
                <textarea
                  readOnly
                  value={GOODWIN_SUPABASE_SQL}
                  onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                  className="w-full h-64 glass-input p-3 font-mono text-[11px] leading-relaxed resize-y bg-black/5 dark:bg-black/40 text-gray-800 dark:text-gray-200 rounded-xl"
                />
              </div>
            )}

            {/* Schema Instructions */}
            <div className="glass rounded-2xl p-4 border border-[#00a631]/20 bg-[#00a631]/5 space-y-2">
              <p className="text-xs font-extrabold text-[#3a3b39] dark:text-white leading-normal">
                📋 Setup Instructions:
              </p>
              <ol className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-relaxed space-y-1 list-decimal list-inside">
                <li>Click <strong>Copy SQL Schema</strong> (or click View Code above).</li>
                <li>Click <strong>Open SQL Editor</strong> to open your Supabase project editor.</li>
                <li>Paste into Supabase SQL Editor and click <strong>Run</strong>.</li>
                <li>Click <strong>Test Connection</strong> above to verify!</li>
              </ol>
            </div>
          </div>

          {/* Company Profile Info */}
          <div className="glass-strong p-6 sm:p-8 rounded-3xl border border-white/60 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200/60 dark:border-white/10">
              <Building2 className="w-5 h-5 text-[#3a3b39] dark:text-gray-300 shrink-0" />
              <h2 className="text-base font-black text-[#3a3b39] dark:text-white leading-snug">
                Company & Bank Profile
              </h2>
            </div>
            <div className="space-y-2 text-xs leading-relaxed">
              <p className="font-extrabold text-[#3a3b39] dark:text-white text-sm">{settings.name}</p>
              <p className="text-gray-500 dark:text-gray-400">
                GSTIN: <span className="font-mono font-bold text-[#3a3b39] dark:text-white">{settings.gstin}</span>
              </p>
              <p className="text-gray-500 dark:text-gray-400">Address: {settings.address}</p>
              <p className="text-gray-500 dark:text-gray-400">
                Bank: {settings.bank_details.bank_name} &nbsp;|&nbsp; A/C: {settings.bank_details.account_number}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: Battery Configurator */}
        <div className="lg:col-span-6">
          <div className="glass-strong p-6 sm:p-8 rounded-3xl border border-white/60 dark:border-white/10 shadow-sm">
            <form onSubmit={handleSaveConfigs} className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200/60 dark:border-white/10">
                <Battery className="w-5 h-5 text-[#00a631] shrink-0" />
                <h2 className="text-base font-black text-[#3a3b39] dark:text-white leading-snug">
                  Goodwin Battery Configurator
                </h2>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300 leading-normal block">
                  Voltage Ratings (comma-separated)
                </label>
                <input
                  type="text"
                  value={voltages}
                  onChange={(e) => setVoltages(e.target.value)}
                  placeholder="12V, 24V, 48V"
                  className="w-full glass-input px-4 py-2.5 text-xs font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300 leading-normal block">
                  Ah Ratings (comma-separated)
                </label>
                <input
                  type="text"
                  value={ahRatings}
                  onChange={(e) => setAhRatings(e.target.value)}
                  placeholder="8Ah, 14Ah, 35Ah, 150Ah"
                  className="w-full glass-input px-4 py-2.5 text-xs font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300 leading-normal block">
                  Warehouse Locations (1 per line)
                </label>
                <textarea
                  value={warehouses}
                  onChange={(e) => setWarehouses(e.target.value)}
                  placeholder={'Warehouse A / Rack-01\nWarehouse A / Rack-04\nWarehouse B'}
                  className="w-full glass-input px-4 py-2.5 text-xs font-bold h-24 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300 leading-normal block">
                  Salesperson Names (comma-separated)
                </label>
                <input
                  type="text"
                  value={salespersons}
                  onChange={(e) => setSalespersons(e.target.value)}
                  placeholder="Deepak Singh, Priya Sharma, Rajesh Kumar"
                  className="w-full glass-input px-4 py-2.5 text-xs font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#00a631] hover:bg-[#008a29] text-white
                           font-extrabold text-sm rounded-xl shadow-md shadow-[#00a631]/25
                           cursor-pointer transition-all"
              >
                Save Configuration Settings
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
