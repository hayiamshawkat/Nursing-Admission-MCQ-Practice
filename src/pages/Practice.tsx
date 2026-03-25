import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, LayoutGrid, ListChecks, ChevronRight, GraduationCap } from 'lucide-react';
import { SUBJECTS } from '../types';
import { motion } from 'motion/react';

export default function Practice() {
  const navigate = useNavigate();

  const startPractice = (subject?: string, count: number = 50) => {
    const params = new URLSearchParams();
    params.set('type', 'practice');
    params.set('count', count.toString());
    if (subject) params.set('subject', subject);
    navigate(`/exam?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-12 max-w-5xl mx-auto">
      <div className="text-center flex flex-col gap-4">
        <h1 className="text-4xl font-bold text-gray-900">Practice Mode</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">Choose your preferred practice style to sharpen your skills. No time limit, instant results.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Quick Practice */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <LayoutGrid className="w-6 h-6 text-blue-600" />
            Quick Practice
          </h2>
          <div className="grid gap-4">
            <motion.button
              whileHover={{ x: 5 }}
              onClick={() => startPractice(undefined, 50)}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-blue-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <ListChecks className="w-6 h-6" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-bold text-gray-900">Random 50 Questions</span>
                  <span className="text-sm text-gray-500">Mixed subjects, perfect for a quick session.</span>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-blue-600 transition-colors" />
            </motion.button>

            <motion.button
              whileHover={{ x: 5 }}
              onClick={() => startPractice(undefined, 100)}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-blue-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-bold text-gray-900">Random 100 Questions</span>
                  <span className="text-sm text-gray-500">Full length practice session.</span>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-blue-600 transition-colors" />
            </motion.button>
          </div>
        </section>

        {/* Subject Wise */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-600" />
            Subject Wise Practice
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SUBJECTS.map((subject, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.02 }}
                onClick={() => startPractice(subject, 50)}
                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:border-blue-200 hover:shadow-md transition-all text-left"
              >
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-600 font-bold uppercase text-xs">
                  {subject.slice(0, 2)}
                </div>
                <span className="font-bold text-gray-800 capitalize text-sm">{subject}</span>
              </motion.button>
            ))}
          </div>
        </section>
      </div>

      {/* Info Card */}
      <section className="bg-blue-50 p-8 rounded-3xl border border-blue-100 flex flex-col md:flex-row items-center gap-8">
        <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-200">
          <BookOpen className="w-10 h-10" />
        </div>
        <div className="flex flex-col gap-2 text-center md:text-left">
          <h3 className="text-xl font-bold text-blue-900">Why use Practice Mode?</h3>
          <p className="text-blue-800 opacity-80">Practice mode allows you to focus on specific subjects without the pressure of a timer. You can review each question as you go and build your confidence before jumping into a Mock Exam.</p>
        </div>
      </section>
    </div>
  );
}
