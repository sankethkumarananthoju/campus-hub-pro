export type UserRole = 'student' | 'teacher' | 'hod';

export type PassStatus = 'Pending' | 'Approved' | 'Denied';

export interface PassRequest {
  id: string;
  studentID: string;
  studentName: string;
  reason: string;
  requestedTime: Date;
  status: PassStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
}

export interface Question {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'short-answer';
  question: string;
  options?: string[];
  correctAnswer: string;
  points: number;
}

export interface Assignment {
  id: string;
  teacherID: string;
  teacherName: string;
  classID: string;
  title: string;
  description: string;
  questions: Question[];
  dueDate: Date;
  totalPoints: number;
  createdAt: Date;
}

export interface Submission {
  id: string;
  assignmentID: string;
  studentID: string;
  studentName: string;
  studentAnswers: Record<string, string>;
  score: number;
  maxScore: number;
  percentage: number;
  correctedTime: Date;
  feedback: Record<string, { correct: boolean; correctAnswer: string }>;
}

export interface PerformanceData {
  studentID: string;
  studentName: string;
  weeklyAverage: number;
  totalAssignments: number;
  completedAssignments: number;
  trend: 'improving' | 'declining' | 'stable';
}

export interface PeriodTiming {
  id: string;
  periodNumber: number;
  startTime: string;
  endTime: string;
  isBreak: boolean;
  label: string;
}

export interface TimetableEntry {
  id: string;
  classID: string;
  year: 1 | 2 | 3 | 4;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  periodNumber: number;
  subject: string;
  teacherID: string;
  teacherName: string;
}

export interface SubjectMaster {
  year: 1 | 2 | 3 | 4;
  subjects: string[];
}
