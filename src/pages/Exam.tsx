import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db, collection, getDocs, query, limit, addDoc, doc, updateDoc, getDoc, Timestamp } from '../firebase';
import { Question, ExamRecord, ExamResult } from '../types';
import { Clock, ChevronLeft, ChevronRight, Send, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function Exam() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const examType = (queryParams.get('type') as 'mock' | 'practice') || 'mock';
  const subject = queryParams.get('subject');
  const questionCount = parseInt(queryParams.get('count') || (examType === 'mock' ? '100' : '50'));

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(examType === 'mock' ? 3600 : 0); // 60 mins for mock
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [subject, questionCount]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'questions'), limit(500)); // Fetch a pool to randomize
      const querySnapshot = await getDocs(q);
      let allQuestions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
      
      if (subject) {
        allQuestions = allQuestions.filter(q => q.subject === subject);
      }

      // Shuffle and pick
      const shuffled = allQuestions.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, questionCount);
      
      if (selected.length === 0) {
        toast.error('No questions found for this criteria.');
        navigate('/dashboard');
        return;
      }

      setQuestions(selected);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to load questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (submitting || isFinished) return;
    setSubmitting(true);

    try {
      let correctCount = 0;
      let wrongCount = 0;
      const results: ExamResult[] = [];

      questions.forEach((q) => {
        const userAnswer = answers[q.id] || '';
        const isCorrect = userAnswer === q.correct;
        if (userAnswer) {
          if (isCorrect) correctCount++;
          else wrongCount++;
        }
        results.push({
          examId: '', // Will update after exam creation
          questionId: q.id,
          userAnswer,
          correctAnswer: q.correct,
        });
      });

      const score = correctCount;
      const total = questions.length;
      const percentage = Math.round((score / total) * 100);

      const examData: Omit<ExamRecord, 'id'> = {
        userId: user!.uid,
        userName: profile?.name || 'Student',
        score,
        total,
        percentage,
        correctCount,
        wrongCount,
        type: examType,
        subject: subject || undefined,
        date: new Date().toISOString(),
      };

      const examRef = await addDoc(collection(db, 'exams'), examData);
      
      // Save detailed results
      const resultsPromises = results.map(res => 
        addDoc(collection(db, `exams/${examRef.id}/results`), { ...res, examId: examRef.id })
      );
      await Promise.all(resultsPromises);

      // Update user stats
      if (profile) {
        const userRef = doc(db, 'users', user!.uid);
        const newBestScore = Math.max(profile.bestScore || 0, percentage);
        await updateDoc(userRef, {
          bestScore: newBestScore,
          totalExams: (profile.totalExams || 0) + 1,
        });
      }

      setIsFinished(true);
      toast.success('Exam submitted successfully!');
      navigate(`/result/${examRef.id}`);
    } catch (error) {
      console.error('Error submitting exam:', error);
      toast.error('Failed to submit exam.');
    } finally {
      setSubmitting(false);
    }
  }, [answers, questions, user, profile, examType, subject, navigate, submitting, isFinished]);

  useEffect(() => {
    if (examType === 'mock' && timeLeft > 0 && !isFinished) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [examType, isFinished, timeLeft]);

  useEffect(() => {
    if (examType === 'mock' && timeLeft === 0 && !isFinished && !loading && questions.length > 0) {
      handleSubmit();
    }
  }, [timeLeft, examType, isFinished, handleSubmit, loading, questions.length]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId: string, option: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 font-medium">Preparing your exam paper...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-gray-600 font-medium">No questions found.</p>
        <button onClick={() => navigate('/dashboard')} className="text-blue-600 font-bold hover:underline">
          Go back to Dashboard
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];
  const progress = questions.length > 0 ? ((currentIdx + 1) / questions.length) * 100 : 0;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between sticky top-20 z-40">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-gray-900 capitalize">{examType} Exam {subject ? `- ${subject}` : ''}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> {answeredCount}/{questions.length} Answered</span>
            <span className="flex items-center gap-1"><AlertCircle className="w-4 h-4 text-yellow-500" /> {questions.length - answeredCount} Remaining</span>
          </div>
        </div>
        
        {examType === 'mock' && (
          <div className={`flex items-center gap-3 px-6 py-3 rounded-xl font-mono text-2xl font-bold ${timeLeft < 300 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-blue-50 text-blue-600'}`}>
            <Clock className="w-6 h-6" />
            {formatTime(timeLeft)}
          </div>
        )}

        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to submit the exam?')) {
              handleSubmit();
            }
          }}
          disabled={submitting}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 active:scale-95"
        >
          <Send className="w-5 h-5" />
          {submitting ? 'Submitting...' : 'Submit Exam'}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-blue-600"
        />
      </div>

      {/* Question Area */}
      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-8"
            >
              <div className="flex items-start gap-4">
                <span className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0">
                  {currentIdx + 1}
                </span>
                <h2 className="text-2xl font-bold text-gray-900 leading-relaxed">
                  {currentQuestion.question}
                </h2>
              </div>

              <div className="grid gap-4">
                {['a', 'b', 'c', 'd'].map((opt) => {
                  const optionKey = `option_${opt}` as keyof Question;
                  const isSelected = answers[currentQuestion.id] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => handleAnswer(currentQuestion.id, opt)}
                      className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left group ${
                        isSelected 
                        ? 'border-blue-600 bg-blue-50' 
                        : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold uppercase transition-colors ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600'
                      }`}>
                        {opt}
                      </span>
                      <span className={`text-lg font-medium ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                        {currentQuestion[optionKey] as string}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>
            <div className="text-gray-500 font-medium">
              Question {currentIdx + 1} of {questions.length}
            </div>
            <button
              onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={currentIdx === questions.length - 1}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 disabled:opacity-30 transition-all shadow-sm"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Question Grid Navigation */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-6 h-fit sticky top-44">
          <h3 className="font-bold text-gray-900">Question Navigator</h3>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setCurrentIdx(i)}
                className={`w-full aspect-square rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                  currentIdx === i 
                  ? 'ring-2 ring-blue-600 ring-offset-2 bg-blue-600 text-white' 
                  : answers[q.id] 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-3 h-3 rounded bg-blue-600" /> Current
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-3 h-3 rounded bg-blue-100" /> Answered
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-3 h-3 rounded bg-gray-100" /> Unanswered
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
