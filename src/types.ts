export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  bestScore?: number;
  totalExams?: number;
  createdAt: string;
}

export interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct: 'a' | 'b' | 'c' | 'd';
  subject: string;
  createdAt?: string;
}

export interface ExamRecord {
  id: string;
  userId: string;
  userName: string;
  score: number;
  total: number;
  percentage: number;
  correctCount: number;
  wrongCount: number;
  type: 'mock' | 'practice';
  subject?: string;
  date: string;
}

export interface ExamResult {
  id?: string;
  examId: string;
  questionId: string;
  userAnswer: string;
  correctAnswer: string;
}

export type Subject = 'bangla' | 'math' | 'Biology' | 'Chemistry' | 'Physics' | 'English' | 'General Knowledge';

export const SUBJECTS: Subject[] = [
  'bangla',
  'math',
  'Biology',
  'Chemistry',
  'Physics',
  'English',
  'General Knowledge'
];
