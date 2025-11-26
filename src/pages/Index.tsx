import { useApp } from '@/contexts/AppContext';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import StudentView from './StudentView';
import TeacherView from './TeacherView';
import HODView from './HODView';

export default function Index() {
  const { currentRole } = useApp();

  return (
    <div className="min-h-screen bg-background">
      <RoleSwitcher />
      {currentRole === 'student' && <StudentView />}
      {currentRole === 'teacher' && <TeacherView />}
      {currentRole === 'hod' && <HODView />}
    </div>
  );
}
