import { PassApprovalQueue } from '@/components/teacher/PassApprovalQueue';
import { PerformanceAnalytics } from '@/components/hod/PerformanceAnalytics';
import { CreateAssignment } from '@/components/teacher/CreateAssignment';
import { PeriodTimingManager } from '@/components/hod/PeriodTimingManager';
import { TimetableManager } from '@/components/hod/TimetableManager';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Users, TrendingUp } from 'lucide-react';

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
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timetable">Timetable</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="passes">Pass Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <PerformanceAnalytics />
          </TabsContent>

          <TabsContent value="timetable" className="space-y-6">
            <PeriodTimingManager />
            <TimetableManager />
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            <CreateAssignment />
          </TabsContent>

          <TabsContent value="passes" className="space-y-6">
            <PassApprovalQueue />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
