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
import { Calendar, Plus, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';
import { exportTimetableToPDF } from '@/utils/pdfExport';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

export function TimetableManager() {
  const { periodTimings, timetableEntries, addTimetableEntry, deleteTimetableEntry, subjectsByYear } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<typeof DAYS[number]>('Monday');
  const [selectedYear, setSelectedYear] = useState<1 | 2 | 3 | 4>(1);
  const [newEntry, setNewEntry] = useState({
    classID: '',
    year: 1 as 1 | 2 | 3 | 4,
    dayOfWeek: 'Monday' as typeof DAYS[number],
    periodNumber: 1,
    subject: '',
    teacherID: '',
    teacherName: ''
  });

  const teachingPeriods = periodTimings.filter(p => !p.isBreak);
  const availableSubjects = subjectsByYear.find(s => s.year === newEntry.year)?.subjects || [];

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
      year: 1,
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
    return timetableEntries.filter(entry => entry.dayOfWeek === day && entry.year === selectedYear);
  };

  const getEntryForDayAndPeriod = (day: typeof DAYS[number], periodNumber: number) => {
    return timetableEntries.find(
      entry => entry.dayOfWeek === day && entry.periodNumber === periodNumber && entry.year === selectedYear
    );
  };

  const getUniqueSubjectsAndTeachers = () => {
    const yearEntries = timetableEntries.filter(entry => entry.year === selectedYear);
    const subjectTeacherMap = new Map();
    
    yearEntries.forEach(entry => {
      if (!subjectTeacherMap.has(entry.subject)) {
        subjectTeacherMap.set(entry.subject, {
          subject: entry.subject,
          teacherName: entry.teacherName,
          classID: entry.classID
        });
      }
    });
    
    return Array.from(subjectTeacherMap.values());
  };

  const handleExportPDF = () => {
    exportTimetableToPDF(timetableEntries, periodTimings, selectedYear);
    toast.success('Timetable exported successfully');
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
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
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
                  <Label>Academic Year</Label>
                  <Select
                    value={newEntry.year.toString()}
                    onValueChange={(value) => setNewEntry({ ...newEntry, year: parseInt(value) as 1 | 2 | 3 | 4, subject: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1st Year</SelectItem>
                      <SelectItem value="2">2nd Year</SelectItem>
                      <SelectItem value="3">3rd Year</SelectItem>
                      <SelectItem value="4">4th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                  <Select
                    value={newEntry.subject}
                    onValueChange={(value) => setNewEntry({ ...newEntry, subject: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSubjects.map(subject => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex gap-4">
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(parseInt(value) as 1 | 2 | 3 | 4)}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1st Year</SelectItem>
                <SelectItem value="2">2nd Year</SelectItem>
                <SelectItem value="3">3rd Year</SelectItem>
                <SelectItem value="4">4th Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Grid-based Timetable View */}
          <div className="border rounded-lg overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-bold border-r w-24">Day / Period</TableHead>
                  {periodTimings.map((period) => (
                    <TableHead key={period.id} className="text-center border-r min-w-32">
                      <div className="font-bold">{period.label}</div>
                      <div className="text-xs text-muted-foreground font-normal">
                        {period.startTime} - {period.endTime}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {DAYS.map((day) => (
                  <TableRow key={day} className="hover:bg-muted/30">
                    <TableCell className="font-bold border-r bg-muted/30">{day.toUpperCase()}</TableCell>
                    {periodTimings.map((period) => {
                      const entry = getEntryForDayAndPeriod(day, period.periodNumber);
                      return (
                        <TableCell 
                          key={`${day}-${period.id}`} 
                          className={`text-center border-r relative group ${
                            period.isBreak ? 'bg-muted/20' : ''
                          }`}
                        >
                          {period.isBreak ? (
                            <span className="text-xs text-muted-foreground font-medium">BREAK</span>
                          ) : entry ? (
                            <div className="space-y-1 py-2">
                              <div className="font-semibold text-sm">{entry.subject}</div>
                              <div className="text-xs text-muted-foreground">{entry.classID}</div>
                              {entry && !period.isBreak && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => handleDelete(entry.id)}
                                >
                                  <Trash2 className="h-3 w-3 text-destructive" />
                                </Button>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Subject Legend */}
          {getUniqueSubjectsAndTeachers().length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Subject Details & Faculty Information</h3>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Subject</TableHead>
                      <TableHead>Class ID</TableHead>
                      <TableHead>Faculty Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getUniqueSubjectsAndTeachers().map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{item.subject}</TableCell>
                        <TableCell>{item.classID}</TableCell>
                        <TableCell>{item.teacherName}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
