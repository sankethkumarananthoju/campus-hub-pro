import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SubjectMaster } from '@/types';
import { BookOpen, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

export function SubjectManager() {
  const { subjectsByYear, updateSubjectsByYear } = useApp();
  const [selectedYear, setSelectedYear] = useState<1 | 2 | 3 | 4>(1);
  const [newSubject, setNewSubject] = useState('');

  const currentYearSubjects = subjectsByYear.find(s => s.year === selectedYear)?.subjects || [];

  const handleAddSubject = () => {
    if (!newSubject.trim()) {
      toast.error('Please enter a subject name');
      return;
    }

    const updatedSubjects = subjectsByYear.map(yearData => {
      if (yearData.year === selectedYear) {
        return {
          ...yearData,
          subjects: [...yearData.subjects, newSubject.trim()]
        };
      }
      return yearData;
    });

    updateSubjectsByYear(updatedSubjects);
    setNewSubject('');
    toast.success('Subject added successfully');
  };

  const handleRemoveSubject = (subjectToRemove: string) => {
    const updatedSubjects = subjectsByYear.map(yearData => {
      if (yearData.year === selectedYear) {
        return {
          ...yearData,
          subjects: yearData.subjects.filter(s => s !== subjectToRemove)
        };
      }
      return yearData;
    });

    updateSubjectsByYear(updatedSubjects);
    toast.success('Subject removed successfully');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Subject Management
        </CardTitle>
        <CardDescription>Manage subjects for each academic year</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-4">
          <div className="flex-1 space-y-2">
            <Label>Select Year</Label>
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(parseInt(value) as 1 | 2 | 3 | 4)}
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
        </div>

        <div className="space-y-2">
          <Label>Add New Subject</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter subject name"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
            />
            <Button onClick={handleAddSubject}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Subjects for Year {selectedYear}</Label>
          <div className="flex flex-wrap gap-2">
            {currentYearSubjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">No subjects added yet</p>
            ) : (
              currentYearSubjects.map((subject) => (
                <Badge key={subject} variant="secondary" className="px-3 py-1.5 text-sm">
                  {subject}
                  <button
                    onClick={() => handleRemoveSubject(subject)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
