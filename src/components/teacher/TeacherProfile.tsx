import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, BookOpen, Users, Save, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function TeacherProfile() {
  const { teachers, currentUserID, updateTeacher, subjectsByYear } = useApp();
  const currentTeacher = teachers.find(t => t.id === currentUserID);
  
  const [isEditing, setIsEditing] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>(currentTeacher?.assignedYear?.toString() || '');
  const [selectedSubject, setSelectedSubject] = useState<string>(currentTeacher?.assignedSubject || '');
  const [selectedClass, setSelectedClass] = useState<string>(currentTeacher?.assignedClass || '');

  const today = new Date();
  const formattedDate = format(today, 'EEEE, MMMM d, yyyy');

  const years = [1, 2, 3, 4] as const;
  const classes = ['A', 'B', 'C'];

  const getSubjectsForYear = (year: number) => {
    const yearData = subjectsByYear.find(s => s.year === year);
    return yearData?.subjects || [];
  };

  const handleSave = () => {
    if (!selectedYear || !selectedSubject) {
      toast.error('Please select both year and subject');
      return;
    }

    updateTeacher(currentUserID, {
      assignedYear: parseInt(selectedYear) as 1 | 2 | 3 | 4,
      assignedSubject: selectedSubject,
      assignedClass: selectedClass ? `${selectedYear}-${selectedClass}` : undefined
    });

    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setSelectedSubject(''); // Reset subject when year changes
  };

  if (!currentTeacher) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Teacher profile not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Display */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-4 flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Today's Date</p>
            <p className="font-semibold text-foreground">{formattedDate}</p>
          </div>
        </CardContent>
      </Card>

      {/* Profile Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            My Teaching Profile
          </CardTitle>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Assignment
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{currentTeacher.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{currentTeacher.email}</p>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <h4 className="font-medium">Update Teaching Assignment</h4>
              
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Select value={selectedYear} onValueChange={handleYearChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border">
                      {years.map(year => (
                        <SelectItem key={year} value={year.toString()}>
                          Year {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select 
                    value={selectedSubject} 
                    onValueChange={setSelectedSubject}
                    disabled={!selectedYear}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border max-h-60">
                      {selectedYear && getSubjectsForYear(parseInt(selectedYear)).map(subject => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Section (Optional)</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Section" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border">
                      <SelectItem value="">All Sections</SelectItem>
                      {classes.map(cls => (
                        <SelectItem key={cls} value={cls}>
                          Section {cls}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 border rounded-lg bg-muted/30">
              <h4 className="font-medium mb-3">Current Teaching Assignment</h4>
              <div className="flex flex-wrap gap-3">
                {currentTeacher.assignedYear ? (
                  <Badge variant="secondary" className="text-sm py-1 px-3">
                    <BookOpen className="h-3 w-3 mr-1" />
                    Year {currentTeacher.assignedYear}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-sm py-1 px-3">
                    No year assigned
                  </Badge>
                )}
                
                {currentTeacher.assignedSubject ? (
                  <Badge className="text-sm py-1 px-3">
                    {currentTeacher.assignedSubject}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-sm py-1 px-3">
                    No subject assigned
                  </Badge>
                )}

                {currentTeacher.assignedClass && (
                  <Badge variant="secondary" className="text-sm py-1 px-3">
                    Class {currentTeacher.assignedClass}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
