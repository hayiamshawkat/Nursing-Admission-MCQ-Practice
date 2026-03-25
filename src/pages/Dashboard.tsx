import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db, collection, query, where, orderBy, limit, getDocs } from '../firebase';
import { ExamRecord } from '../types';
import { Play, BookOpen, Trophy, History, TrendingUp, Award, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function Dashboard() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [recentExams, setRecentExams] = useState<ExamRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecentExams();
    }
  }, [user]);

  const fetchRecentExams = async () => {
    try {
      const q = query(
        collection(db, 'exams'),
        where('userId', '==', user?.uid),
        orderBy('date', 'desc'),
        limit(5)
      );
      const querySnapshot = await getDocs(q);
      const exams = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExamRecord));
      setRecentExams(exams);
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast.error('Failed to load recent exams.');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Best Score', value: `${profile?.bestScore || 0}%`, icon: <Award className="w-5 h-5" />, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Total Exams', value: profile?.totalExams || 0, icon: <History className="w-5 h-5" />, color: 'bg-blue-50 text-blue-600' },
    { label: 'Avg. Accuracy', value: recentExams.length > 0 ? `${Math.round(recentExams.reduce((acc, curr) => acc + curr.percentage, 0) / recentExams.length)}%` : '0%', icon: <TrendingUp className="w-5 h-5" />, color: 'bg-green-50 text-green-600' },
    { label: 'Status', value: 'Active', icon: <Trophy className="w-5 h-5" />, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <h1 className="text-3xl font-bold">Welcome back, {profile?.name}! 👋</h1>
          <p className="text-blue-100 text-lg">You're doing great! Ready to crush another exam today?</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/exam')}
            className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg flex items-center gap-2 active:scale-95"
          >
            <Play className="w-5 h-5 fill-current" />
            Start Mock Exam
          </button>
          <button
            onClick={() => navigate('/practice')}
            className="bg-blue-500 text-white border border-blue-400 px-8 py-3 rounded-xl font-bold hover:bg-blue-400 transition-all shadow-lg flex items-center gap-2 active:scale-95"
          >
            <BookOpen className="w-5 h-5" />
            Practice Mode
          </button>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
              {stat.icon}
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 font-medium">{stat.label}</span>
              <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
            </div>
          </motion.div>
        ))}
      </section>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <section className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <History className="w-6 h-6 text-blue-600" />
              Recent Exams
            </h2>
            <button className="text-blue-600 font-medium hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-gray-500">Loading your history...</div>
            ) : recentExams.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {recentExams.map((exam) => (
                  <div 
                    key={exam.id} 
                    onClick={() => navigate(`/result/${exam.id}`)}
                    className="p-6 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${exam.type === 'mock' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                        {exam.type === 'mock' ? <Award className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 capitalize">{exam.type} Exam {exam.subject ? `- ${exam.subject}` : ''}</span>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(exam.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="flex flex-col items-end">
                        <span className="text-lg font-bold text-gray-900">{exam.score}/{exam.total}</span>
                        <span className={`text-sm font-medium ${exam.percentage >= 70 ? 'text-green-600' : exam.percentage >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {exam.percentage}%
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                  <History className="w-8 h-8" />
                </div>
                <p className="text-gray-500">No exams taken yet. Start your first mock exam now!</p>
                <button
                  onClick={() => navigate('/exam')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all"
                >
                  Take Mock Exam
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Quick Tips / Info */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            Study Tips
          </h2>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
            <div className="p-4 bg-blue-50 rounded-xl border-l-4 border-blue-600">
              <p className="text-sm text-blue-800 font-medium">Focus on Biology and Chemistry as they carry the highest weightage in the exam.</p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl border-l-4 border-green-600">
              <p className="text-sm text-green-800 font-medium">Practice at least 100 MCQs daily to improve your speed and accuracy.</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl border-l-4 border-purple-600">
              <p className="text-sm text-purple-800 font-medium">Review your wrong answers after every mock exam to identify weak areas.</p>
            </div>
          </div>

          <div className="bg-indigo-600 p-6 rounded-2xl shadow-lg text-white flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12" />
            <h3 className="text-xl font-bold">Need Help?</h3>
            <p className="text-indigo-100">Join our Telegram group for daily quizzes and study materials.</p>
            <button className="bg-white text-indigo-600 px-6 py-2 rounded-xl font-bold hover:bg-indigo-50 transition-all w-fit">
              Join Community
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
