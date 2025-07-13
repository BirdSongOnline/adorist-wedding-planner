import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  BarChart3, 
  Heart, 
  LogOut, 
  Eye,
  TrendingUp,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { authFunctions, dbFunctions, Profile } from '../lib/supabase';

interface AdminDashboardProps {
  onSignOut: () => void;
}

interface ClientProgress {
  profile: Profile;
  progress: {
    total: number;
    completed: number;
    percentage: number;
  };
}

export default function AdminDashboard({ onSignOut }: AdminDashboardProps) {
  const [clients, setClients] = useState<ClientProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadClientsData();
  }, []);

  const loadClientsData = async () => {
    try {
      setLoading(true);
      const profiles = await dbFunctions.getAllProfiles();
      
      const clientsWithProgress = await Promise.all(
        profiles.map(async (profile) => {
          const progress = await dbFunctions.getProfileProgress(profile.id);
          return { profile, progress };
        })
      );

      setClients(clientsWithProgress);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await authFunctions.signOut();
      onSignOut();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getOverallStats = () => {
    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.progress.percentage > 0).length;
    const averageProgress = clients.length > 0 
      ? Math.round(clients.reduce((sum, c) => sum + c.progress.percentage, 0) / clients.length)
      : 0;
    const completedClients = clients.filter(c => c.progress.percentage === 100).length;

    return { totalClients, activeClients, averageProgress, completedClients };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-12 h-12 text-rose-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = getOverallStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-rose-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Adorist Admin</h1>
                <p className="text-sm text-gray-600">Client Management Dashboard</p>
              </div>
            </div>
            
            <button
              onClick={handleSignOut}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-1" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalClients}</div>
                <div className="text-sm text-gray-600">Total Clients</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.activeClients}</div>
                <div className="text-sm text-gray-600">Active Clients</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.averageProgress}%</div>
                <div className="text-sm text-gray-600">Average Progress</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <CheckCircle2 className="w-8 h-8 text-rose-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.completedClients}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Clients Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Client Overview</h2>
            <p className="text-sm text-gray-600">Monitor all wedding planning progress</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Couple
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wedding Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tasks Completed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clients.map(({ profile, progress }) => (
                  <tr key={profile.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center mr-3">
                          <Heart className="w-5 h-5 text-rose-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {profile.couple_names}
                          </div>
                          <div className="text-sm text-gray-500">{profile.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {profile.wedding_date 
                          ? formatDate(profile.wedding_date)
                          : 'Not set'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-3" style={{ width: '100px' }}>
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress.percentage)}`}
                            style={{ width: `${progress.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {progress.percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {progress.completed} / {progress.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(profile.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        progress.percentage === 100
                          ? 'bg-green-100 text-green-800'
                          : progress.percentage > 0
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {progress.percentage === 100 
                          ? 'Completed' 
                          : progress.percentage > 0 
                          ? 'In Progress' 
                          : 'Not Started'
                        }
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {clients.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No clients yet</h3>
              <p className="text-gray-600">Clients will appear here once they sign up</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
