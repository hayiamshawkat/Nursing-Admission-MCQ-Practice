import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, doc, getDoc, collection, getDocs } from '../firebase';
import { ExamRecord, ExamResult, Question } from '../types';
import { Trophy, CheckCircle2, XCircle, BarChart3, Clock, ChevronLeft, LayoutDashboard, RefreshCw, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function Result() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [exam, setExam] = useState<ExamRecord | null>(null);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [questions, setQuestions] = useState<Record<string, Question>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (examId) {
      fetchExamData();
    }
  }, [examId]);

  const fetchExamData = async () => {
    try {
      setLoading(true);
      const examDoc = await getDoc(doc(db, 'exams', examId!));
      if (!examDoc.exists()) {
        toast.error('Exam not found.');
        navigate('/dashboard');
        return;
      }
      const examData = { id: examDoc.id, ...examDoc.data() } as ExamRecord;
      setExam(examData);

      // Fetch results
      const resultsSnapshot = await getDocs(collection(db, `exams/${examId}/results`));
      const resultsData = resultsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExamResult));
      setResults(resultsData);

      // Fetch question details for review
      const questionIds = resultsData.map(r => r.questionId);
      const questionPromises = questionIds.map(id => getDoc(doc(db, 'questions', id)));
      const questionSnapshots = await Promise.all(questionPromises);
      const questionsMap: Record<string, Question> = {};
      questionSnapshots.forEach(snap => {
        if (snap.exists()) {
          questionsMap[snap.id] = { id: snap.id, ...snap.data() } as Question;
        }
      });
      setQuestions(questionsMap);
    } catch (error) {
      console.error('Error fetching exam data:', error);
      toast.error('Failed to load exam results.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 font-medium">Analyzing your performance...</p>
      </div>
    );
  }

  if (!exam) return null;

  const stats = [
    { label: 'Score', value: `${exam.score}/${exam.total}`, icon: <Trophy className="w-5 h-5" />, color: 'bg-blue-50 text-blue-600' },
    { label: 'Accuracy', value: `${exam.percentage}%`, icon: <BarChart3 className="w-5 h-5" />, color: 'bg-green-50 text-green-600' },
    { label: 'Correct', value: exam.correctCount, icon: <CheckCircle2 className="w-5 h-5" />, color: 'bg-green-50 text-green-600' },
    { label: 'Wrong', value: exam.wrongCount, icon: <XCircle className="w-5 h-5" />, color: 'bg-red-50 text-red-600' },
  ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-10 py-6">
      {/* Result Header */}
      <section className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-6">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`w-24 h-24 rounded-full flex items-center justify-center ${exam.percentage >= 70 ? 'bg-green-100 text-green-600' : exam.percentage >= 40 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}
        >
          {exam.percentage >= 70 ? <Trophy className="w-12 h-12" /> : <BarChart3 className="w-12 h-12" />}
        </motion.div>
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold text-gray-900">
            {exam.percentage >= 70 ? 'Excellent Work!' : exam.percentage >= 40 ? 'Good Effort!' : 'Keep Practicing!'}
          </h1>
          <p className="text-gray-500 text-lg">You completed the {exam.type} exam on {new Date(exam.date).toLocaleDateString()}.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-2xl mt-4">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
              <span className="text-sm text-gray-500 font-medium">{stat.label}</span>
              <span className="text-xl font-bold text-gray-900">{stat.value}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-4 mt-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>
          <button
            onClick={() => navigate(exam.type === 'mock' ? '/exam' : '/practice')}
            className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
        </div>
      </section>

      {/* Question Review */}
      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          Question Review
        </h2>
        <div className="flex flex-col gap-6">
          {results.map((result, i) => {
            const q = questions[result.questionId];
            if (!q) return null;
            const isCorrect = result.userAnswer === result.correctAnswer;
            const isUnanswered = !result.userAnswer;

            return (
              <div key={i} className={`bg-white p-8 rounded-3xl shadow-sm border-2 transition-all ${isCorrect ? 'border-green-100' : isUnanswered ? 'border-gray-100' : 'border-red-100'}`}>
                <div className="flex items-start gap-4 mb-6">
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${isCorrect ? 'bg-green-600 text-white' : isUnanswered ? 'bg-gray-600 text-white' : 'bg-red-600 text-white'}`}>
                    {i + 1}
                  </span>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-bold text-gray-900 leading-relaxed">{q.question}</h3>
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{q.subject}</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {['a', 'b', 'c', 'd'].map((opt) => {
                    const optionKey = `option_${opt}` as keyof Question;
                    const isUserChoice = result.userAnswer === opt;
                    const isCorrectChoice = result.correctAnswer === opt;

                    let bgColor = 'bg-gray-50 border-gray-100';
                    let textColor = 'text-gray-700';
                    let icon = null;

                    if (isCorrectChoice) {
                      bgColor = 'bg-green-50 border-green-200';
                      textColor = 'text-green-900';
                      icon = <CheckCircle2 className="w-5 h-5 text-green-600" />;
                    } else if (isUserChoice && !isCorrect) {
                      bgColor = 'bg-red-50 border-red-200';
                      textColor = 'text-red-900';
                      icon = <XCircle className="w-5 h-5 text-red-600" />;
                    }

                    return (
                      <div 
                        key={opt}
                        className={`flex items-center justify-between p-4 rounded-xl border-2 ${bgColor} ${textColor}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold uppercase text-sm ${isCorrectChoice ? 'bg-green-600 text-white' : isUserChoice ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            {opt}
                          </span>
                          <span className="font-medium">{q[optionKey] as string}</span>
                        </div>
                        {icon}
                      </div>
                    );
                  })}
                </div>

                {!isCorrect && !isUnanswered && (
                  <div className="mt-6 p-4 bg-red-50 rounded-xl flex items-center gap-3 text-red-800 text-sm font-medium">
                    <XCircle className="w-5 h-5 shrink-0" />
                    <span>You selected option {result.userAnswer.toUpperCase()}, but the correct answer is {result.correctAnswer.toUpperCase()}.</span>
                  </div>
                )}
                {isUnanswered && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl flex items-center gap-3 text-gray-800 text-sm font-medium">
                    <Clock className="w-5 h-5 shrink-0" />
                    <span>You didn't answer this question. The correct answer is {result.correctAnswer.toUpperCase()}.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
