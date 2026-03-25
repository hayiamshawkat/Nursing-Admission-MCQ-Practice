import React, { useEffect, useState } from 'react';
import { db, collection, query, orderBy, limit, getDocs, where } from '../firebase';
import { ExamRecord } from '../types';
import { Trophy, Medal, Award, User, BarChart3, TrendingUp, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function Leaderboard() {
  const [topExams, setTopExams] = useState<ExamRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'mock' | 'practice'>('mock');

  useEffect(() => {
    fetchLeaderboard();
  }, [filter]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      let q = query(
        collection(db, 'exams'),
        where('type', '==', filter),
        orderBy('score', 'desc'),
        orderBy('date', 'desc'),
        limit(50)
      );
      
      const querySnapshot = await getDocs(q);
      const exams = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExamRecord));
      
      // Filter unique users to show their best score
      const uniqueUsers: Record<string, ExamRecord> = {};
      exams.forEach(exam => {
        if (!uniqueUsers[exam.userId] || uniqueUsers[exam.userId].score < exam.score) {
          uniqueUsers[exam.userId] = exam;
        }
      });

      const sorted = Object.values(uniqueUsers).sort((a, b) => b.score - a.score);
      setTopExams(sorted);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Failed to load leaderboard.');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-8 h-8 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-8 h-8 text-gray-400" />;
    if (rank === 3) return <Award className="w-8 h-8 text-amber-600" />;
    return <span className="text-xl font-bold text-gray-400 w-8 h-8 flex items-center justify-center">{rank}</span>;
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-10 py-6">
      <div className="text-center flex flex-col gap-4">
        <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
          <Trophy className="w-10 h-10 text-yellow-500" />
          Nationwide Leaderboard
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">Compete with thousands of nursing aspirants and see where you stand in the nationwide competition.</p>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 w-fit mx-auto">
        <button
          onClick={() => setFilter('mock')}
          className={`px-8 py-3 rounded-xl font-bold transition-all ${filter === 'mock' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          Mock Exams
        </button>
        <button
          onClick={() => setFilter('practice')}
          className={`px-8 py-3 rounded-xl font-bold transition-all ${filter === 'practice' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          Practice Sessions
        </button>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 font-medium">Calculating rankings...</p>
          </div>
        ) : topExams.length > 0 ? (
          <div className="flex flex-col">
            <div className="grid grid-cols-12 p-6 bg-gray-50 border-b border-gray-100 text-sm font-bold text-gray-500 uppercase tracking-wider">
              <div className="col-span-2 text-center">Rank</div>
              <div className="col-span-6">Student Name</div>
              <div className="col-span-2 text-center">Score</div>
              <div className="col-span-2 text-center">Accuracy</div>
            </div>
            <div className="divide-y divide-gray-100">
              {topExams.map((exam, i) => (
                <motion.div 
                  key={exam.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`grid grid-cols-12 p-6 items-center hover:bg-gray-50 transition-colors ${i < 3 ? 'bg-blue-50/30' : ''}`}
                >
                  <div className="col-span-2 flex justify-center">
                    {getRankIcon(i + 1)}
                  </div>
                  <div className="col-span-6 flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-full border border-gray-200 flex items-center justify-center text-gray-400">
                      <User className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">{exam.userName}</span>
                      <span className="text-xs text-gray-500">Member since {new Date(exam.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-lg font-bold text-gray-900">{exam.score}/{exam.total}</span>
                  </div>
                  <div className="col-span-2 text-center">
                    <div className="flex flex-col items-center">
                      <span className={`text-lg font-bold ${exam.percentage >= 70 ? 'text-green-600' : exam.percentage >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {exam.percentage}%
                      </span>
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                        <div className={`h-full ${exam.percentage >= 70 ? 'bg-green-500' : exam.percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${exam.percentage}%` }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-20 text-center flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
              <Search className="w-10 h-10" />
            </div>
            <p className="text-gray-500 text-lg">No rankings available yet. Be the first to take an exam!</p>
          </div>
        )}
      </div>

      {/* Stats Footer - Removed hardcoded demo stats */}
    </div>
  );
}
