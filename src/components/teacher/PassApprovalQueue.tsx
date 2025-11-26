import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export function PassApprovalQueue() {
  const { passRequests, updatePassStatus, currentUserName } = useApp();
  const { toast } = useToast();

  const pendingRequests = passRequests.filter(req => req.status === 'Pending');

  const handleApprove = (id: string, studentName: string) => {
    updatePassStatus(id, 'Approved', currentUserName);
    toast({
      title: 'Pass Approved',
      description: `${studentName}'s pass request has been approved`,
    });
  };

  const handleDeny = (id: string, studentName: string) => {
    updatePassStatus(id, 'Denied', currentUserName);
    toast({
      title: 'Pass Denied',
      description: `${studentName}'s pass request has been denied`,
      variant: 'destructive'
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-warning/10 rounded-lg">
            <Clock className="h-5 w-5 text-warning" />
          </div>
          <div className="flex-1">
            <CardTitle>Pass Approval Queue</CardTitle>
            <CardDescription>Review and approve student pass requests</CardDescription>
          </div>
          {pendingRequests.length > 0 && (
            <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
              {pendingRequests.length} Pending
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {pendingRequests.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-success mx-auto mb-2" />
            <p className="text-muted-foreground">No pending pass requests</p>
          </div>
        ) : (
          pendingRequests.map(request => (
            <div
              key={request.id}
              className="p-4 border border-border rounded-lg bg-card hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-muted rounded-full">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{request.studentName}</h3>
                    <Badge variant="outline" className="text-xs">
                      {request.studentID}
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground">{request.reason}</p>
                  <p className="text-xs text-muted-foreground">
                    Requested {formatDistanceToNow(request.requestedTime, { addSuffix: true })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 border-destructive/20 hover:bg-destructive/10 text-destructive hover:text-destructive"
                    onClick={() => handleDeny(request.id, request.studentName)}
                  >
                    <XCircle className="h-4 w-4" />
                    Deny
                  </Button>
                  <Button
                    size="sm"
                    className="gap-2 bg-success hover:bg-success/90"
                    onClick={() => handleApprove(request.id, request.studentName)}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
