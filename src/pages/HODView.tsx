import { PassApprovalQueue } from '@/components/teacher/PassApprovalQueue';
import { PerformanceAnalytics } from '@/components/hod/PerformanceAnalytics';
import { CreateAssignment } from '@/components/teacher/CreateAssignment';
import { AssignmentScheduler } from '@/components/teacher/AssignmentScheduler';
import { PeriodTimingManager } from '@/components/hod/PeriodTimingManager';
import { TimetableManager } from '@/components/hod/TimetableManager';
import { SubjectManager } from '@/components/hod/SubjectManager';
import { AddTeacher } from '@/components/hod/AddTeacher';
import { VinsaAssistant } from '@/components/teacher/VinsaAssistant';
import { QuestionBankViewer } from '@/components/teacher/QuestionBankViewer';
import { SemesterPlanner } from '@/components/teacher/SemesterPlanner';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Users, TrendingUp, Sparkles, BookOpen, Calendar, UserPlus, CalendarClock } from 'lucide-react';

export default function HODView() {
  const { assignments, submissions, passRequests } = useApp();

  const pendingPasses = passRequests.filter(req => req.status === 'Pending').length;
  const uniqueStudents = new Set(submissions.map(sub => sub.studentID)).size;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">HOD Dashboard</h1>
          <p className="text-muted-foreground">Overview of department activities and performance</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <span className="text-3xl font-bold">{assignments.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Users className="h-5 w-5 text-accent" />
                </div>
                <span className="text-3xl font-bold">{uniqueStudents}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Passes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-warning" />
                </div>
                <span className="text-3xl font-bold">{pendingPasses}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="glass flex-wrap">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="teachers" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Manage Teachers
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
            <TabsTrigger value="timetable">Timetable</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="scheduler" className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4" />
              Scheduler
            </TabsTrigger>
            <TabsTrigger value="passes">Pass Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <PerformanceAnalytics />
          </TabsContent>

          <TabsContent value="teachers">
            <AddTeacher />
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

          <TabsContent value="timetable" className="space-y-6">
            <PeriodTimingManager />
            <SubjectManager />
            <TimetableManager />
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            <CreateAssignment />
          </TabsContent>

          <TabsContent value="scheduler">
            <AssignmentScheduler />
          </TabsContent>

          <TabsContent value="passes" className="space-y-6">
            <PassApprovalQueue />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
