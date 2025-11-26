import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Award } from 'lucide-react';

export function MyPerformance() {
  const { submissions, currentUserID } = useApp();

  const mySubmissions = submissions.filter(sub => sub.studentID === currentUserID);
  
  const weeklyAverage = mySubmissions.length > 0
    ? Math.round(mySubmissions.reduce((sum, sub) => sum + sub.percentage, 0) / mySubmissions.length)
    : 0;

  const getTrend = () => {
    if (mySubmissions.length < 2) return 'stable';
    const recent = mySubmissions.slice(0, Math.ceil(mySubmissions.length / 2));
    const older = mySubmissions.slice(Math.ceil(mySubmissions.length / 2));
    
    const recentAvg = recent.reduce((sum, sub) => sum + sub.percentage, 0) / recent.length;
    const olderAvg = older.reduce((sum, sub) => sum + sub.percentage, 0) / older.length;
    
    if (recentAvg > olderAvg + 5) return 'improving';
    if (recentAvg < olderAvg - 5) return 'declining';
    return 'stable';
  };

  const trend = getTrend();

  const TrendIcon = trend === 'improving' ? TrendingUp : trend === 'declining' ? TrendingDown : Minus;
  const trendColor = trend === 'improving' ? 'text-success' : trend === 'declining' ? 'text-destructive' : 'text-muted-foreground';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Award className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>My Performance</CardTitle>
            <CardDescription>Your weekly academic overview</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Weekly Average</p>
            <p className="text-3xl font-bold text-foreground">{weeklyAverage}%</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Assignments Completed</p>
            <p className="text-3xl font-bold text-foreground">{mySubmissions.length}</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Trend</p>
            <div className="flex items-center gap-2">
              <TrendIcon className={`h-6 w-6 ${trendColor}`} />
              <p className="text-lg font-semibold capitalize">{trend}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
