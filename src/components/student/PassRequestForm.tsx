import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { LogOut } from 'lucide-react';

export function PassRequestForm() {
  const { currentUserID, currentUserName, addPassRequest } = useApp();
  const { toast } = useToast();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for your pass request',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      addPassRequest({
        studentID: currentUserID,
        studentName: currentUserName,
        reason: reason.trim()
      });

      toast({
        title: 'Pass Request Submitted',
        description: 'Your request has been sent for approval',
      });

      setReason('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit pass request',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <LogOut className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Request Outgoing Pass</CardTitle>
            <CardDescription>Submit a request to leave campus</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Leave</Label>
            <Textarea
              id="reason"
              placeholder="e.g., Medical Emergency - Doctor Appointment, Family Emergency, etc."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Pass Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
