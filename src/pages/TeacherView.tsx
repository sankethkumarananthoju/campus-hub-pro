import { PassApprovalQueue } from '@/components/teacher/PassApprovalQueue';
import { CreateAssignment } from '@/components/teacher/CreateAssignment';

export default function TeacherView() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <p className="text-muted-foreground">Approve passes and create assignments for your classes</p>
        </div>

        <PassApprovalQueue />
        <CreateAssignment />
      </div>
    </div>
  );
}
