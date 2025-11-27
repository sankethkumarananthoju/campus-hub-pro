import { PassApprovalQueue } from '@/components/teacher/PassApprovalQueue';
import { CreateAssignment } from '@/components/teacher/CreateAssignment';
import { VinsaAssistant } from '@/components/teacher/VinsaAssistant';
import { QuestionBankViewer } from '@/components/teacher/QuestionBankViewer';
import { SemesterPlanner } from '@/components/teacher/SemesterPlanner';
import { TeacherProfile } from '@/components/teacher/TeacherProfile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardCheck, FileText, Sparkles, BookOpen, Calendar, User } from 'lucide-react';

export default function TeacherView() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <p className="text-muted-foreground">Manage passes, assignments, and use VINSA AI Assistant</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="glass flex-wrap">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              My Profile
            </TabsTrigger>
            <TabsTrigger value="vinsa" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              VINSA Chat
            </TabsTrigger>
            <TabsTrigger value="semester" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Semester Planner
            </TabsTrigger>
            <TabsTrigger value="question-bank" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Question Bank
            </TabsTrigger>
            <TabsTrigger value="passes" className="flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4" />
              Pass Requests
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Create Assignment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <TeacherProfile />
          </TabsContent>

          <TabsContent value="vinsa">
            <VinsaAssistant />
          </TabsContent>

          <TabsContent value="semester">
            <SemesterPlanner />
          </TabsContent>

          <TabsContent value="question-bank">
            <QuestionBankViewer />
          </TabsContent>

          <TabsContent value="passes">
            <PassApprovalQueue />
          </TabsContent>

          <TabsContent value="assignments">
            <CreateAssignment />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
