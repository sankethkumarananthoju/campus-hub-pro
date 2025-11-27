import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole, PassRequest, Assignment, Submission, PeriodTiming, TimetableEntry, SubjectMaster, QuestionBankItem, Teacher } from '@/types';

interface AppContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUserID: string;
  currentUserName: string;
  passRequests: PassRequest[];
  addPassRequest: (request: Omit<PassRequest, 'id' | 'requestedTime' | 'status'>) => void;
  updatePassStatus: (id: string, status: 'Approved' | 'Denied', reviewedBy: string) => void;
  assignments: Assignment[];
  addAssignment: (assignment: Omit<Assignment, 'id' | 'createdAt'>) => void;
  submissions: Submission[];
  addSubmission: (submission: Omit<Submission, 'id' | 'correctedTime'>) => void;
  periodTimings: PeriodTiming[];
  updatePeriodTimings: (timings: PeriodTiming[]) => void;
  timetableEntries: TimetableEntry[];
  addTimetableEntry: (entry: Omit<TimetableEntry, 'id'>) => void;
  updateTimetableEntry: (id: string, entry: Partial<TimetableEntry>) => void;
  deleteTimetableEntry: (id: string) => void;
  subjectsByYear: SubjectMaster[];
  updateSubjectsByYear: (subjects: SubjectMaster[]) => void;
  // Question Bank
  questionBank: QuestionBankItem[];
  addToQuestionBank: (question: QuestionBankItem) => void;
  removeFromQuestionBank: (id: string) => void;
  // Teachers
  teachers: Teacher[];
  addTeacher: (teacher: Omit<Teacher, 'id' | 'joinedAt'>) => void;
  updateTeacher: (id: string, updates: Partial<Teacher>) => void;
  removeTeacher: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock data for demonstration
const mockPassRequests: PassRequest[] = [
  {
    id: '1',
    studentID: 'S001',
    studentName: 'Aarav Sharma',
    reason: 'Medical Emergency - Doctor Appointment',
    requestedTime: new Date(Date.now() - 1000 * 60 * 30),
    status: 'Pending'
  },
  {
    id: '2',
    studentID: 'S002',
    studentName: 'Priya Patel',
    reason: 'Family Emergency',
    requestedTime: new Date(Date.now() - 1000 * 60 * 45),
    status: 'Pending'
  }
];

const mockAssignments: Assignment[] = [
  {
    id: 'A001',
    teacherID: 'T001',
    teacherName: 'Dr. Rajesh Kumar',
    classID: 'CS-2A',
    title: 'Data Structures - Arrays & Linked Lists',
    description: 'Complete the following questions on basic data structures',
    questions: [
      {
        id: 'Q1',
        type: 'multiple-choice',
        question: 'What is the time complexity of accessing an element in an array?',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        correctAnswer: 'O(1)',
        points: 10
      },
      {
        id: 'Q2',
        type: 'fill-blank',
        question: 'A linked list consists of nodes where each node contains data and a ___ to the next node.',
        correctAnswer: 'pointer',
        points: 10
      }
    ],
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
    totalPoints: 20,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
  }
];

const mockSubmissions: Submission[] = [];

const defaultPeriodTimings: PeriodTiming[] = [
  { id: 'P1', periodNumber: 1, startTime: '08:45', endTime: '09:35', isBreak: false, label: '1st Period' },
  { id: 'P2', periodNumber: 2, startTime: '09:35', endTime: '10:25', isBreak: false, label: '2nd Period' },
  { id: 'B1', periodNumber: 3, startTime: '10:25', endTime: '10:40', isBreak: true, label: 'Break' },
  { id: 'P3', periodNumber: 4, startTime: '10:40', endTime: '11:30', isBreak: false, label: '3rd Period' },
  { id: 'P4', periodNumber: 5, startTime: '11:30', endTime: '12:20', isBreak: false, label: '4th Period' },
  { id: 'P5', periodNumber: 6, startTime: '12:20', endTime: '13:10', isBreak: false, label: '5th Period' },
  { id: 'B2', periodNumber: 7, startTime: '13:10', endTime: '14:00', isBreak: true, label: 'Lunch Break' },
  { id: 'P6', periodNumber: 8, startTime: '14:00', endTime: '14:45', isBreak: false, label: '6th Period' },
  { id: 'P7', periodNumber: 9, startTime: '14:45', endTime: '15:30', isBreak: false, label: '7th Period' },
];

const mockTimetableEntries: TimetableEntry[] = [];

const mockTeachers: Teacher[] = [
  {
    id: 'T001',
    name: 'Dr. Rajesh Kumar',
    email: 'rajesh.kumar@college.edu',
    phone: '9876543210',
    assignedSubject: 'Data Structures',
    assignedYear: 2,
    assignedClass: '2-A',
    joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365)
  },
  {
    id: 'T002',
    name: 'Prof. Anita Singh',
    email: 'anita.singh@college.edu',
    assignedSubject: 'Machine Learning',
    assignedYear: 4,
    joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 200)
  }
];

const defaultSubjectsByYear: SubjectMaster[] = [
  {
    year: 1,
    subjects: [
      'Engineering Mathematics I',
      'Engineering Physics',
      'Engineering Chemistry',
      'Programming in C',
      'Engineering Graphics',
      'Communication Skills',
      'Basic Electrical Engineering'
    ]
  },
  {
    year: 2,
    subjects: [
      'Data Structures',
      'Digital Electronics',
      'Computer Organization',
      'Discrete Mathematics',
      'Object Oriented Programming',
      'Database Management Systems',
      'Computer Networks'
    ]
  },
  {
    year: 3,
    subjects: [
      'Operating Systems',
      'Software Engineering',
      'Web Technologies',
      'Design and Analysis of Algorithms',
      'Theory of Computation',
      'Compiler Design',
      'Computer Graphics'
    ]
  },
  {
    year: 4,
    subjects: [
      'Machine Learning',
      'Artificial Intelligence',
      'Cloud Computing',
      'Big Data Analytics',
      'Cyber Security',
      'Mobile Application Development',
      'Project Work'
    ]
  }
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('student');
  const [passRequests, setPassRequests] = useState<PassRequest[]>(mockPassRequests);
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments);
  const [submissions, setSubmissions] = useState<Submission[]>(mockSubmissions);
  const [periodTimings, setPeriodTimings] = useState<PeriodTiming[]>(defaultPeriodTimings);
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>(mockTimetableEntries);
  const [subjectsByYear, setSubjectsByYear] = useState<SubjectMaster[]>(defaultSubjectsByYear);
  const [questionBank, setQuestionBank] = useState<QuestionBankItem[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>(mockTeachers);

  // Simulate current user based on role
  const getCurrentUser = () => {
    switch (currentRole) {
      case 'student':
        return { id: 'S001', name: 'Aarav Sharma' };
      case 'teacher':
        return { id: 'T001', name: 'Dr. Rajesh Kumar' };
      case 'hod':
        return { id: 'H001', name: 'Prof. Sunita Desai' };
    }
  };

  const { id: currentUserID, name: currentUserName } = getCurrentUser();

  const addPassRequest = (request: Omit<PassRequest, 'id' | 'requestedTime' | 'status'>) => {
    const newRequest: PassRequest = {
      ...request,
      id: `P${Date.now()}`,
      requestedTime: new Date(),
      status: 'Pending'
    };
    setPassRequests(prev => [newRequest, ...prev]);
  };

  const updatePassStatus = (id: string, status: 'Approved' | 'Denied', reviewedBy: string) => {
    setPassRequests(prev =>
      prev.map(request =>
        request.id === id
          ? { ...request, status, reviewedBy, reviewedAt: new Date() }
          : request
      )
    );
  };

  const addAssignment = (assignment: Omit<Assignment, 'id' | 'createdAt'>) => {
    const newAssignment: Assignment = {
      ...assignment,
      id: `A${Date.now()}`,
      createdAt: new Date()
    };
    setAssignments(prev => [newAssignment, ...prev]);
  };

  const addSubmission = (submission: Omit<Submission, 'id' | 'correctedTime'>) => {
    const newSubmission: Submission = {
      ...submission,
      id: `SUB${Date.now()}`,
      correctedTime: new Date()
    };
    setSubmissions(prev => [newSubmission, ...prev]);
  };

  const updatePeriodTimings = (timings: PeriodTiming[]) => {
    setPeriodTimings(timings);
  };

  const addTimetableEntry = (entry: Omit<TimetableEntry, 'id'>) => {
    const newEntry: TimetableEntry = {
      ...entry,
      id: `TT${Date.now()}`
    };
    setTimetableEntries(prev => [...prev, newEntry]);
  };

  const updateTimetableEntry = (id: string, entry: Partial<TimetableEntry>) => {
    setTimetableEntries(prev =>
      prev.map(item => (item.id === id ? { ...item, ...entry } : item))
    );
  };

  const deleteTimetableEntry = (id: string) => {
    setTimetableEntries(prev => prev.filter(item => item.id !== id));
  };

  const updateSubjectsByYear = (subjects: SubjectMaster[]) => {
    setSubjectsByYear(subjects);
  };

  // Question Bank functions
  const addToQuestionBank = (question: QuestionBankItem) => {
    setQuestionBank(prev => {
      // Avoid duplicates
      if (prev.some(q => q.id === question.id)) {
        return prev;
      }
      return [question, ...prev];
    });
  };

  const removeFromQuestionBank = (id: string) => {
    setQuestionBank(prev => prev.filter(q => q.id !== id));
  };

  // Teacher functions
  const addTeacher = (teacher: Omit<Teacher, 'id' | 'joinedAt'>) => {
    const newTeacher: Teacher = {
      ...teacher,
      id: `T${Date.now()}`,
      joinedAt: new Date()
    };
    setTeachers(prev => [...prev, newTeacher]);
  };

  const updateTeacher = (id: string, updates: Partial<Teacher>) => {
    setTeachers(prev =>
      prev.map(teacher => (teacher.id === id ? { ...teacher, ...updates } : teacher))
    );
  };

  const removeTeacher = (id: string) => {
    setTeachers(prev => prev.filter(teacher => teacher.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        currentUserID,
        currentUserName,
        passRequests,
        addPassRequest,
        updatePassStatus,
        assignments,
        addAssignment,
        submissions,
        addSubmission,
        periodTimings,
        updatePeriodTimings,
        timetableEntries,
        addTimetableEntry,
        updateTimetableEntry,
        deleteTimetableEntry,
        subjectsByYear,
        updateSubjectsByYear,
        questionBank,
        addToQuestionBank,
        removeFromQuestionBank,
        teachers,
        addTeacher,
        updateTeacher,
        removeTeacher,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
