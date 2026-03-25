import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth, signOut, signInWithPopup, googleProvider } from '../firebase';
import { LogOut, User, LayoutDashboard, Trophy, BookOpen, Settings, LogIn } from 'lucide-react';
import { toast } from 'sonner';

export default function Navbar() {
  const { user, profile, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Login failed. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully!');
      navigate('/');
    } catch (error) {
      toast.error('Logout failed.');
    }
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-blue-600 flex items-center gap-2">
          <BookOpen className="w-8 h-8" />
          <span>Nursing MCQ</span>
        </Link>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Link to="/dashboard" className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors">
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <Link to="/leaderboard" className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors">
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Leaderboard</span>
              </Link>
              {isAdmin && (
                <Link to="/admin" className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-900">{profile?.name}</span>
                  <span className="text-xs text-gray-500 capitalize">{profile?.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={handleLogin}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-all shadow-md active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              Login with Google
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
