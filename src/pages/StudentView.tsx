import { PassRequestForm } from '@/components/student/PassRequestForm';
import { AssignmentList } from '@/components/student/AssignmentList';
import { MyPerformance } from '@/components/student/MyPerformance';

export default function StudentView() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <p className="text-muted-foreground">Manage your passes, assignments, and track your performance</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <PassRequestForm />
          <MyPerformance />
        </div>

        <AssignmentList />
      </div>
    </div>
  );
}
