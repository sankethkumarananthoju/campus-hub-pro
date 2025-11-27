import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Calendar, Clock, Send, Edit2, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format, isPast, isFuture } from 'date-fns';
import { Assignment } from '@/types';

export function AssignmentScheduler() {
  const { assignments, updateAssignment, deleteAssignment } = useApp();
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [newScheduleDate, setNewScheduleDate] = useState('');
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);

  // Check and auto-publish scheduled assignments
  useEffect(() => {
    const interval = setInterval(() => {
      assignments.forEach(assignment => {
        if (assignment.scheduledAt && !assignment.isPublished) {
          if (isPast(new Date(assignment.scheduledAt))) {
            updateAssignment(assignment.id, { isPublished: true });
            toast.success(`Assignment "${assignment.title}" has been published to Year ${assignment.targetYear} students!`);
          }
        }
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [assignments, updateAssignment]);

  const filteredAssignments = assignments.filter(a => 
    selectedYear === 'all' || a.targetYear.toString() === selectedYear
  );

  const scheduledAssignments = filteredAssignments.filter(a => a.scheduledAt && !a.isPublished);
  const publishedAssignments = filteredAssignments.filter(a => a.isPublished);

  const handleReschedule = (assignment: Assignment) => {
    setRescheduleId(assignment.id);
    setNewScheduleDate(assignment.scheduledAt ? format(new Date(assignment.scheduledAt), "yyyy-MM-dd'T'HH:mm") : '');
    setIsRescheduleOpen(true);
  };

  const confirmReschedule = () => {
    if (!rescheduleId || !newScheduleDate) {
      toast.error('Please select a valid date and time');
      return;
    }

    const newDate = new Date(newScheduleDate);
    if (isPast(newDate)) {
      toast.error('Schedule date must be in the future');
      return;
    }

    updateAssignment(rescheduleId, { scheduledAt: newDate });
    toast.success('Assignment rescheduled successfully!');
    setIsRescheduleOpen(false);
    setRescheduleId(null);
    setNewScheduleDate('');
  };

  const handlePublishNow = (id: string) => {
    updateAssignment(id, { isPublished: true, scheduledAt: undefined });
    toast.success('Assignment published immediately!');
  };

  const handleDelete = (id: string, title: string) => {
    deleteAssignment(id);
    toast.success(`"${title}" has been deleted`);
  };

  const getStatusBadge = (assignment: Assignment) => {
    if (assignment.isPublished) {
      return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Published</Badge>;
    }
    if (assignment.scheduledAt) {
      if (isFuture(new Date(assignment.scheduledAt))) {
        return <Badge variant="secondary" className="bg-blue-500/20 text-blue-600 border-blue-500/30">Scheduled</Badge>;
      }
    }
    return <Badge variant="outline">Draft</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Assignment Scheduler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label>Filter by Year:</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border">
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="1">Year 1</SelectItem>
                <SelectItem value="2">Year 2</SelectItem>
                <SelectItem value="3">Year 3</SelectItem>
                <SelectItem value="4">Year 4</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Scheduled (Pending) Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-600">
            <Clock className="h-5 w-5" />
            Scheduled Assignments ({scheduledAssignments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scheduledAssignments.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">No scheduled assignments</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Scheduled For</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduledAssignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">{assignment.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Year {assignment.targetYear}</Badge>
                      </TableCell>
                      <TableCell>{assignment.classID}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-blue-500" />
                          {assignment.scheduledAt && format(new Date(assignment.scheduledAt), 'MMM d, yyyy h:mm a')}
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(assignment.dueDate), 'MMM d, yyyy')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReschedule(assignment)}
                          >
                            <Edit2 className="h-4 w-4 mr-1" />
                            Reschedule
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handlePublishNow(assignment.id)}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Publish Now
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleDelete(assignment.id, assignment.title)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

      {/* Published Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Published Assignments ({publishedAssignments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {publishedAssignments.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">No published assignments</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Questions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {publishedAssignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">{assignment.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Year {assignment.targetYear}</Badge>
                      </TableCell>
                      <TableCell>{assignment.classID}</TableCell>
                      <TableCell>{getStatusBadge(assignment)}</TableCell>
                      <TableCell>{format(new Date(assignment.dueDate), 'MMM d, yyyy')}</TableCell>
                      <TableCell>{assignment.questions.length} questions</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reschedule Dialog */}
      <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Schedule Date & Time</Label>
              <Input
                type="datetime-local"
                value={newScheduleDate}
                onChange={(e) => setNewScheduleDate(e.target.value)}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              The assignment will be automatically published to students at this time.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRescheduleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmReschedule}>
              Confirm Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
