import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, Trophy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export function AssignmentList() {
  const { assignments, submissions, currentUserID } = useApp();
  const navigate = useNavigate();

  const getSubmissionForAssignment = (assignmentId: string) => {
    return submissions.find(
      sub => sub.assignmentID === assignmentId && sub.studentID === currentUserID
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-lg">
            <FileText className="h-5 w-5 text-accent" />
          </div>
          <div>
            <CardTitle>My Assignments</CardTitle>
            <CardDescription>Complete and submit your assignments</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {assignments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No assignments available</p>
        ) : (
          assignments.map(assignment => {
            const submission = getSubmissionForAssignment(assignment.id);
            const isOverdue = new Date() > assignment.dueDate;

            return (
              <div
                key={assignment.id}
                className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{assignment.title}</h3>
                      {submission ? (
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                          <Trophy className="h-3 w-3 mr-1" />
                          {submission.percentage}%
                        </Badge>
                      ) : isOverdue ? (
                        <Badge variant="destructive">Overdue</Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{assignment.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Due {formatDistanceToNow(assignment.dueDate, { addSuffix: true })}
                      </span>
                      <span>{assignment.questions.length} questions</span>
                      <span>{assignment.totalPoints} points</span>
                    </div>
                  </div>
                  <div>
                    {submission ? (
                      <Button variant="outline" size="sm" disabled>
                        Submitted
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => navigate(`/assignment/${assignment.id}`)}
                      >
                        Start
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
