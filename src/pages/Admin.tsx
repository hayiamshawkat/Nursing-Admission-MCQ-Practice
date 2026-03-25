import React, { useState, useEffect } from 'react';
import { db, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, limit } from '../firebase';
import { Question, SUBJECTS } from '../types';
import { Plus, Upload, Trash2, Edit2, Search, Filter, Download, FileText, Users, BookOpen, BarChart3, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import Papa from 'papaparse';
import { motion } from 'motion/react';

export default function Admin() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [stats, setStats] = useState({ totalStudents: 0, totalQuestions: 0, totalExams: 0 });

  const [formData, setFormData] = useState<Omit<Question, 'id'>>({
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct: 'a',
    subject: SUBJECTS[0],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'questions'), orderBy('createdAt', 'desc'), limit(100));
      const querySnapshot = await getDocs(q);
      const questionsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
      setQuestions(questionsData);

      // Fetch Stats
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const questionsSnapshot = await getDocs(collection(db, 'questions'));
      const examsSnapshot = await getDocs(collection(db, 'exams'));
      
      setStats({
        totalStudents: usersSnapshot.size,
        totalQuestions: questionsSnapshot.size,
        totalExams: examsSnapshot.size
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingQuestion) {
        await updateDoc(doc(db, 'questions', editingQuestion.id), formData);
        toast.success('Question updated!');
      } else {
        await addDoc(collection(db, 'questions'), { ...formData, createdAt: new Date().toISOString() });
        toast.success('Question added!');
      }
      setIsModalOpen(false);
      setEditingQuestion(null);
      setFormData({ question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct: 'a', subject: SUBJECTS[0] });
      fetchData();
    } catch (error) {
      toast.error('Failed to save question.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteDoc(doc(db, 'questions', id));
        toast.success('Question deleted!');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete question.');
      }
    }
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const data = results.data as any[];
        let successCount = 0;
        let errorCount = 0;

        toast.loading(`Uploading ${data.length} questions...`);

        for (const row of data) {
          try {
            const newQuestion = {
              question: row.question,
              option_a: row.option_a,
              option_b: row.option_b,
              option_c: row.option_c,
              option_d: row.option_d,
              correct: row.correct?.toLowerCase() as 'a' | 'b' | 'c' | 'd',
              subject: row.subject,
              createdAt: new Date().toISOString(),
            };

            if (newQuestion.question && newQuestion.correct && newQuestion.subject) {
              await addDoc(collection(db, 'questions'), newQuestion);
              successCount++;
            } else {
              errorCount++;
            }
          } catch (error) {
            errorCount++;
          }
        }

        toast.dismiss();
        toast.success(`Successfully uploaded ${successCount} questions! ${errorCount} failed.`);
        fetchData();
      },
      error: (error) => {
        toast.error('Failed to parse CSV file.');
      }
    });
  };

  const filteredQuestions = questions.filter(q => 
    q.question.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterSubject === '' || q.subject === filterSubject)
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-xl font-bold border border-gray-200 hover:bg-gray-50 transition-all cursor-pointer shadow-sm">
            <Upload className="w-5 h-5" />
            Upload CSV
            <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
          </label>
          <button
            onClick={() => {
              setEditingQuestion(null);
              setFormData({ question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct: 'a', subject: SUBJECTS[0] });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Add Question
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 font-medium">Total Students</span>
            <span className="text-2xl font-bold text-gray-900">{stats.totalStudents}</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 font-medium">Question Bank</span>
            <span className="text-2xl font-bold text-gray-900">{stats.totalQuestions}</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 font-medium">Exams Taken</span>
            <span className="text-2xl font-bold text-gray-900">{stats.totalExams}</span>
          </div>
        </div>
      </section>

      {/* Filters & Search */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-gray-400 w-5 h-5" />
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none capitalize"
          >
            <option value="">All Subjects</option>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Question Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase">Question</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase">Correct</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">Loading questions...</td></tr>
              ) : filteredQuestions.length > 0 ? (
                filteredQuestions.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 max-w-md">
                        <span className="font-medium text-gray-900 line-clamp-2">{q.question}</span>
                        <div className="flex gap-2 text-xs text-gray-500">
                          <span>A: {q.option_a}</span>
                          <span>B: {q.option_b}</span>
                          <span>C: {q.option_c}</span>
                          <span>D: {q.option_d}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase">{q.subject}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="w-8 h-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center font-bold uppercase">{q.correct}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingQuestion(q);
                            setFormData({
                              question: q.question,
                              option_a: q.option_a,
                              option_b: q.option_b,
                              option_c: q.option_c,
                              option_d: q.option_d,
                              correct: q.correct,
                              subject: q.subject,
                            });
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">No questions found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{editingQuestion ? 'Edit Question' : 'Add New Question'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-8 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">Question Text</label>
                <textarea
                  required
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                  placeholder="Enter the question here..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-700">Option A</label>
                  <input
                    required
                    type="text"
                    value={formData.option_a}
                    onChange={(e) => setFormData({ ...formData, option_a: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-700">Option B</label>
                  <input
                    required
                    type="text"
                    value={formData.option_b}
                    onChange={(e) => setFormData({ ...formData, option_b: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-700">Option C</label>
                  <input
                    required
                    type="text"
                    value={formData.option_c}
                    onChange={(e) => setFormData({ ...formData, option_c: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-700">Option D</label>
                  <input
                    required
                    type="text"
                    value={formData.option_d}
                    onChange={(e) => setFormData({ ...formData, option_d: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-700">Correct Answer</label>
                  <select
                    value={formData.correct}
                    onChange={(e) => setFormData({ ...formData, correct: e.target.value as any })}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                  >
                    <option value="a">Option A</option>
                    <option value="b">Option B</option>
                    <option value="c">Option C</option>
                    <option value="d">Option D</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-700">Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value as any })}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none capitalize"
                  >
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg"
                >
                  <Save className="w-5 h-5" />
                  {editingQuestion ? 'Update Question' : 'Save Question'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
