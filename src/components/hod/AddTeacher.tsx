import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Users, Trash2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function AddTeacher() {
  const { teachers, addTeacher, removeTeacher, subjectsByYear } = useApp();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  const years = [1, 2, 3, 4] as const;

  const getSubjectsForYear = (year: number) => {
    const yearData = subjectsByYear.find(s => s.year === year);
    return yearData?.subjects || [];
  };

  const handleAddTeacher = () => {
    if (!name.trim() || !email.trim()) {
      toast.error('Please enter name and email');
      return;
    }

    addTeacher({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      assignedYear: selectedYear ? parseInt(selectedYear) as 1 | 2 | 3 | 4 : undefined,
      assignedSubject: selectedSubject || undefined,
    });

    // Reset form
    setName('');
    setEmail('');
    setPhone('');
    setSelectedYear('');
    setSelectedSubject('');
    
    toast.success('Teacher added successfully!');
  };

  const handleRemoveTeacher = (id: string, teacherName: string) => {
    removeTeacher(id);
    toast.success(`${teacherName} has been removed`);
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setSelectedSubject('');
  };

  return (
    <div className="space-y-6">
      {/* Add Teacher Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add New Teacher
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Enter teacher's name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input
                id="phone"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Assign Year (Optional)</Label>
              <Select value={selectedYear || "_none"} onValueChange={(val) => handleYearChange(val === "_none" ? "" : val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent className="bg-popover border">
                  <SelectItem value="_none">Not Assigned</SelectItem>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      Year {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Assign Subject (Optional)</Label>
              <Select 
                value={selectedSubject || "_none"} 
                onValueChange={(val) => setSelectedSubject(val === "_none" ? "" : val)}
                disabled={!selectedYear}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedYear ? "Select Subject" : "Select year first"} />
                </SelectTrigger>
                <SelectContent className="bg-popover border max-h-60">
                  <SelectItem value="_none">Not Assigned</SelectItem>
                  {selectedYear && getSubjectsForYear(parseInt(selectedYear)).map(subject => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleAddTeacher} className="w-full md:w-auto">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Teacher
          </Button>
        </CardContent>
      </Card>

      {/* Teachers List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Teachers ({teachers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {teachers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No teachers added yet. Add your first teacher above.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-medium">{teacher.name}</TableCell>
                      <TableCell>{teacher.email}</TableCell>
                      <TableCell>{teacher.phone || '-'}</TableCell>
                      <TableCell>
                        {teacher.assignedYear ? (
                          <Badge variant="secondary">Year {teacher.assignedYear}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {teacher.assignedSubject ? (
                          <Badge className="flex items-center gap-1 w-fit">
                            <BookOpen className="h-3 w-3" />
                            {teacher.assignedSubject.length > 20 
                              ? teacher.assignedSubject.slice(0, 20) + '...' 
                              : teacher.assignedSubject}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(teacher.joinedAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleRemoveTeacher(teacher.id, teacher.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
