import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole, PassRequest, Assignment, Submission } from '@/types';

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

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('student');
  const [passRequests, setPassRequests] = useState<PassRequest[]>(mockPassRequests);
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments);
  const [submissions, setSubmissions] = useState<Submission[]>(mockSubmissions);

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
        addSubmission
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
