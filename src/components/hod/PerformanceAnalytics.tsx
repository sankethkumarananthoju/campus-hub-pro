import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { TrendingUp, TrendingDown, Minus, BarChart3, GraduationCap } from 'lucide-react';
import { PerformanceData } from '@/types';

// Helper to extract year from classID (e.g., "CS-2A" -> 2)
const getYearFromClassID = (classID: string): number => {
  const match = classID.match(/(\d)/);
  return match ? parseInt(match[1]) : 0;
};

export function PerformanceAnalytics() {
  const { submissions, assignments } = useApp();
  const [selectedYear, setSelectedYear] = useState<string>('all');

  // Get assignment classIDs map for filtering
  const assignmentClassMap = new Map<string, string>();
  assignments.forEach(a => assignmentClassMap.set(a.id, a.classID));

  // Calculate performance data for students filtered by year
  const calculatePerformance = (): PerformanceData[] => {
    const studentMap = new Map<string, { total: number; count: number; name: string; scores: number[]; year: number }>();

    submissions.forEach(sub => {
      const classID = assignmentClassMap.get(sub.assignmentID) || '';
      const year = getYearFromClassID(classID);
      
      // Filter by year if selected
      if (selectedYear !== 'all' && year !== parseInt(selectedYear)) {
        return;
      }

      if (!studentMap.has(sub.studentID)) {
        studentMap.set(sub.studentID, {
          total: 0,
          count: 0,
          name: sub.studentName,
          scores: [],
          year
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Weekly Performance Analytics</CardTitle>
              <CardDescription>Student performance overview and trends</CardDescription>
            </div>
          </div>
          
          {/* Year Filter */}
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm text-muted-foreground">Year:</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="1">Year 1</SelectItem>
                <SelectItem value="2">Year 2</SelectItem>
                <SelectItem value="3">Year 3</SelectItem>
                <SelectItem value="4">Year 4</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {performanceData.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {selectedYear !== 'all' 
              ? `No performance data available for Year ${selectedYear}` 
              : 'No performance data available'}
          </p>
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
