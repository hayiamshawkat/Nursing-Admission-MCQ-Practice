import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth, signInWithPopup, googleProvider } from '../firebase';
import { BookOpen, Trophy, Clock, CheckCircle, Users, BarChart3, LogIn } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function Home() {
  const { user } = useAuth();
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

  const features = [
    { icon: <BookOpen className="w-6 h-6" />, title: '25,000+ MCQs', desc: 'Comprehensive question bank covering all nursing admission subjects.' },
    { icon: <Clock className="w-6 h-6" />, title: 'Real-time Mock Exams', desc: '100 questions in 60 minutes, just like the real admission test.' },
    { icon: <Trophy className="w-6 h-6" />, title: 'Leaderboard', desc: 'Compete with thousands of students and see your nationwide rank.' },
    { icon: <BarChart3 className="w-6 h-6" />, title: 'Detailed Analytics', desc: 'Track your progress with subject-wise performance reports.' },
    { icon: <CheckCircle className="w-6 h-6" />, title: 'Practice Mode', desc: 'Unlimited practice with instant feedback and correct answers.' },
    { icon: <Users className="w-6 h-6" />, title: 'Community', desc: 'Join thousands of aspiring nurses on their journey to success.' },
  ];

  return (
    <div className="flex flex-col gap-20 py-10">
      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row items-center justify-between gap-12">
        <div className="flex-1 flex flex-col gap-6 text-center lg:text-left">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl lg:text-7xl font-extrabold text-gray-900 leading-tight"
          >
            Master Your <span className="text-blue-600">Nursing Admission</span> Exam
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 max-w-2xl"
          >
            The most complete platform for nursing aspirants in Bangladesh. Practice with 25,000+ MCQs, take real-time mock exams, and track your ranking.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
          >
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 active:scale-95"
              >
                Go to Dashboard
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 active:scale-95"
              >
                <LogIn className="w-5 h-5" />
                Start Practicing Now
              </button>
            )}
            <button
              onClick={() => navigate('/leaderboard')}
              className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all active:scale-95"
            >
              View Leaderboard
            </button>
          </motion.div>
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex-1 relative grid grid-cols-2 gap-4"
        >
          <div className="w-full aspect-square bg-blue-100 rounded-full absolute -z-10 blur-3xl opacity-50 animate-pulse" />
          <img 
            src="https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=400&q=80" 
            alt="Female Nurse" 
            className="rounded-3xl shadow-xl w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <img 
            src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80" 
            alt="Male Nurse" 
            className="rounded-3xl shadow-xl w-full h-full object-cover mt-8"
            referrerPolicy="no-referrer"
          />
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-8 bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600">Active</div>
          <div className="text-gray-500 font-medium">Question Bank</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600">Real-time</div>
          <div className="text-gray-500 font-medium">Leaderboard</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600">Detailed</div>
          <div className="text-gray-500 font-medium">Performance</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600">Mock</div>
          <div className="text-gray-500 font-medium">Exams</div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="flex flex-col gap-12">
        <div className="text-center flex flex-col gap-4">
          <h2 className="text-4xl font-bold text-gray-900">Everything you need to succeed</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">We provide the best tools and resources to help you crack the nursing admission exam with confidence.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 rounded-3xl p-12 text-center text-white flex flex-col gap-8 items-center">
        <h2 className="text-4xl font-bold">Ready to start your journey?</h2>
        <p className="text-blue-100 text-xl max-w-2xl">Join thousands of students who are already preparing for their dream career in nursing.</p>
        <button
          onClick={user ? () => navigate('/dashboard') : handleLogin}
          className="bg-white text-blue-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-xl active:scale-95"
        >
          {user ? 'Go to Dashboard' : 'Get Started for Free'}
        </button>
      </section>
    </div>
  );
}
