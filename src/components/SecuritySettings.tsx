import React, { useState } from 'react';
import { Shield, LogOut, Smartphone, Monitor, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const SecuritySettings: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: functionError } = await supabase.functions.invoke('list-sessions');
      if (functionError) throw functionError;
      if (data.error) throw new Error(data.error);
      setSessions(data.sessions || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch sessions.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOutAll = async () => {
    if (confirm('Are you sure you want to sign out from all other devices?')) {
      const { error } = await supabase.auth.signOut({ scope: 'others' });
      if (error) {
        alert('Failed to sign out from other devices.');
      } else {
        alert('Successfully signed out from all other devices.');
        fetchSessions();
      }
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('iphone') || ua.includes('android') || ua.includes('mobile')) {
      return <Smartphone className="w-5 h-5 text-gray-400" />;
    }
    return <Monitor className="w-5 h-5 text-gray-400" />;
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-yellow-400" /> Active Sessions
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          This is a list of devices that have logged into your account. Revoke any sessions that you do not recognize.
        </p>
        <button onClick={fetchSessions} disabled={loading} className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 text-sm">
          {loading ? 'Loading...' : 'Show Active Sessions'}
        </button>
        {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
        <div className="mt-4 space-y-3">
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                {getDeviceIcon(s.user?.user_metadata?.user_agent || '')}
                <div>
                  <p className="font-semibold text-white">{s.user?.user_metadata?.user_agent || 'Unknown Device'}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Globe className="w-3 h-3" /> {s.user?.user_metadata?.ip_address || 'IP not available'}
                    <span className="mx-1">•</span>
                    Last seen: {new Date(s.user?.last_sign_in_at || Date.now()).toLocaleString()}
                  </p>
                </div>
              </div>
              {s.id === session?.user.id ? (
                <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full">Current</span>
              ) : (
                <button className="text-xs text-red-400 hover:underline">Revoke</button>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-gray-700 pt-8">
        <h3 className="text-lg sm:text-xl font-semibold text-red-400 mb-4">Danger Zone</h3>
        <button onClick={handleSignOutAll} className="flex items-center gap-2 text-red-400 hover:text-red-300">
          <LogOut className="w-4 h-4" /> Sign Out From All Other Devices
        </button>
      </div>
    </div>
  );
};

export default SecuritySettings;