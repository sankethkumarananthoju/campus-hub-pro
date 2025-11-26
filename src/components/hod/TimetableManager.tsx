import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TimetableEntry } from '@/types';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

export function TimetableManager() {
  const { periodTimings, timetableEntries, addTimetableEntry, deleteTimetableEntry } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<typeof DAYS[number]>('Monday');
  const [newEntry, setNewEntry] = useState({
    classID: '',
    dayOfWeek: 'Monday' as typeof DAYS[number],
    periodNumber: 1,
    subject: '',
    teacherID: '',
    teacherName: ''
  });

  const teachingPeriods = periodTimings.filter(p => !p.isBreak);

  const handleAddEntry = () => {
    if (!newEntry.classID || !newEntry.subject || !newEntry.teacherName) {
      toast.error('Please fill all required fields');
      return;
    }

    addTimetableEntry(newEntry);
    toast.success('Timetable entry added successfully');
    setIsDialogOpen(false);
    setNewEntry({
      classID: '',
      dayOfWeek: 'Monday',
      periodNumber: 1,
      subject: '',
      teacherID: '',
      teacherName: ''
    });
  };

  const handleDelete = (id: string) => {
    deleteTimetableEntry(id);
    toast.success('Timetable entry deleted');
  };

  const getEntriesForDay = (day: typeof DAYS[number]) => {
    return timetableEntries.filter(entry => entry.dayOfWeek === day);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Timetable Manager
            </CardTitle>
            <CardDescription>Create and manage the weekly schedule for all classes</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Timetable Entry</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Class ID</Label>
                  <Input
                    placeholder="e.g., CS-2A"
                    value={newEntry.classID}
                    onChange={(e) => setNewEntry({ ...newEntry, classID: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Day</Label>
                  <Select
                    value={newEntry.dayOfWeek}
                    onValueChange={(value) => setNewEntry({ ...newEntry, dayOfWeek: value as typeof DAYS[number] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.map(day => (
                        <SelectItem key={day} value={day}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Period</Label>
                  <Select
                    value={newEntry.periodNumber.toString()}
                    onValueChange={(value) => setNewEntry({ ...newEntry, periodNumber: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {teachingPeriods.map(period => (
                        <SelectItem key={period.id} value={period.periodNumber.toString()}>
                          {period.label} ({period.startTime} - {period.endTime})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    placeholder="e.g., Data Structures"
                    value={newEntry.subject}
                    onChange={(e) => setNewEntry({ ...newEntry, subject: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Teacher Name</Label>
                  <Input
                    placeholder="e.g., Dr. Rajesh Kumar"
                    value={newEntry.teacherName}
                    onChange={(e) => setNewEntry({ ...newEntry, teacherName: e.target.value })}
                  />
                </div>
                <Button onClick={handleAddEntry} className="w-full">
                  Add Entry
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select value={selectedDay} onValueChange={(value) => setSelectedDay(value as typeof DAYS[number])}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DAYS.map(day => (
                <SelectItem key={day} value={day}>{day}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getEntriesForDay(selectedDay).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No timetable entries for {selectedDay}
                    </TableCell>
                  </TableRow>
                ) : (
                  getEntriesForDay(selectedDay).map((entry) => {
                    const period = periodTimings.find(p => p.periodNumber === entry.periodNumber);
                    return (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{period?.label}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {period?.startTime} - {period?.endTime}
                        </TableCell>
                        <TableCell>{entry.classID}</TableCell>
                        <TableCell>{entry.subject}</TableCell>
                        <TableCell>{entry.teacherName}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(entry.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
