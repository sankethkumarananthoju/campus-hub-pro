import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import { PerformanceData } from '@/types';

export function PerformanceAnalytics() {
  const { submissions } = useApp();

  // Calculate performance data for all students
  const calculatePerformance = (): PerformanceData[] => {
    const studentMap = new Map<string, { total: number; count: number; name: string; scores: number[] }>();

    submissions.forEach(sub => {
      if (!studentMap.has(sub.studentID)) {
        studentMap.set(sub.studentID, {
          total: 0,
          count: 0,
          name: sub.studentName,
          scores: []
        });
      }
      const student = studentMap.get(sub.studentID)!;
      student.total += sub.percentage;
      student.count += 1;
      student.scores.push(sub.percentage);
    });

    const performanceData: PerformanceData[] = [];

    studentMap.forEach((data, studentID) => {
      const weeklyAverage = Math.round(data.total / data.count);
      
      // Calculate trend
      let trend: 'improving' | 'declining' | 'stable' = 'stable';
      if (data.scores.length >= 2) {
        const mid = Math.ceil(data.scores.length / 2);
        const recentAvg = data.scores.slice(0, mid).reduce((sum, s) => sum + s, 0) / mid;
        const olderAvg = data.scores.slice(mid).reduce((sum, s) => sum + s, 0) / (data.scores.length - mid);
        
        if (recentAvg > olderAvg + 5) trend = 'improving';
        else if (recentAvg < olderAvg - 5) trend = 'declining';
      }

      performanceData.push({
        studentID,
        studentName: data.name,
        weeklyAverage,
        totalAssignments: data.count,
        completedAssignments: data.count,
        trend
      });
    });

    return performanceData.sort((a, b) => b.weeklyAverage - a.weeklyAverage);
  };

  const performanceData = calculatePerformance();

  const getTrendIcon = (trend: string) => {
    if (trend === 'improving') return <TrendingUp className="h-4 w-4 text-success" />;
    if (trend === 'declining') return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getPerformanceBadge = (percentage: number) => {
    if (percentage >= 90) return <Badge className="bg-success/10 text-success border-success/20">Excellent</Badge>;
    if (percentage >= 75) return <Badge className="bg-primary/10 text-primary border-primary/20">Good</Badge>;
    if (percentage >= 60) return <Badge variant="secondary">Average</Badge>;
    return <Badge variant="destructive">Needs Attention</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Weekly Performance Analytics</CardTitle>
            <CardDescription>Student performance overview and trends</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {performanceData.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No performance data available</p>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead className="text-center">Completed</TableHead>
                  <TableHead className="text-center">Weekly Avg</TableHead>
                  <TableHead className="text-center">Performance</TableHead>
                  <TableHead className="text-center">Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {performanceData.map((student) => (
                  <TableRow key={student.studentID}>
                    <TableCell className="font-medium">{student.studentName}</TableCell>
                    <TableCell className="text-muted-foreground">{student.studentID}</TableCell>
                    <TableCell className="text-center">{student.completedAssignments}</TableCell>
                    <TableCell className="text-center">
                      <span className="text-lg font-semibold">{student.weeklyAverage}%</span>
                    </TableCell>
                    <TableCell className="text-center">
                      {getPerformanceBadge(student.weeklyAverage)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        {getTrendIcon(student.trend)}
                        <span className="text-sm capitalize">{student.trend}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
