import React, { useState, useEffect } from 'react';
import AuthForm from './components/AuthForm';
import WeddingPlanner from './components/WeddingPlanner';
import AdminDashboard from './components/AdminDashboard';
import { authFunctions, supabase } from './lib/supabase';
import { Heart } from 'lucide-react';

function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await loadProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        await loadProfile(user.id);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async (userId: string) => {
    try {
      const profileData = await authFunctions.getCurrentProfile();
      setProfile(profileData);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleAuthSuccess = () => {
    // User state will be updated by the auth state change listener
  };

  const handleSignOut = () => {
    setUser(null);
    setProfile(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-12 h-12 text-rose-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth form if not logged in
  if (!user) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  // Show admin dashboard if user is admin
  if (profile?.is_admin) {
    return <AdminDashboard onSignOut={handleSignOut} />;
  }

  // Show wedding planner for regular users
  return <WeddingPlanner onSignOut={handleSignOut} />;
}

export default App;
