import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { FilePlus, Plus, Trash2, GraduationCap, Clock, Send } from 'lucide-react';
import { Question } from '@/types';

// Classes organized by year
const classesByYear: Record<number, string[]> = {
  1: ['CS-1A', 'CS-1B', 'CS-1C'],
  2: ['CS-2A', 'CS-2B', 'CS-2C'],
  3: ['CS-3A', 'CS-3B', 'CS-3C'],
  4: ['CS-4A', 'CS-4B', 'CS-4C'],
};

export function CreateAssignment() {
  const { currentUserID, currentUserName, addAssignment } = useApp();
  const { toast } = useToast();
  
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [classID, setClassID] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [questions, setQuestions] = useState<Partial<Question>[]>([
    { type: 'multiple-choice', question: '', correctAnswer: '', points: 10, options: ['', '', '', ''] }
  ]);

  const availableClasses = selectedYear ? classesByYear[parseInt(selectedYear)] || [] : [];

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { type: 'multiple-choice', question: '', correctAnswer: '', points: 10, options: ['', '', '', ''] }
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    const options = [...(updated[qIndex].options || [])];
    options[oIndex] = value;
    updated[qIndex] = { ...updated[qIndex], options };
    setQuestions(updated);
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setClassID(''); // Reset class when year changes
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !selectedYear || !classID || !dueDate || questions.length === 0) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields including year and class',
        variant: 'destructive'
      });
      return;
    }

    if (scheduleEnabled && !scheduledDate) {
      toast({
        title: 'Error',
        description: 'Please select a schedule date and time',
        variant: 'destructive'
      });
      return;
    }

    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);

    addAssignment({
      teacherID: currentUserID,
      teacherName: currentUserName,
      classID,
      targetYear: parseInt(selectedYear) as 1 | 2 | 3 | 4,
      title,
      description,
      questions: questions as Question[],
      dueDate: new Date(dueDate),
      totalPoints,
      isPublished: !scheduleEnabled,
      scheduledAt: scheduleEnabled ? new Date(scheduledDate) : undefined
    });

    toast({
      title: scheduleEnabled ? 'Assignment Scheduled' : 'Assignment Created',
      description: scheduleEnabled 
        ? `${title} will be pushed to Year ${selectedYear} students at the scheduled time`
        : `${title} has been posted to Year ${selectedYear} - ${classID}`,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setSelectedYear('');
    setClassID('');
    setDueDate('');
    setScheduleEnabled(false);
    setScheduledDate('');
    setQuestions([{ type: 'multiple-choice', question: '', correctAnswer: '', points: 10, options: ['', '', '', ''] }]);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-lg">
            <FilePlus className="h-5 w-5 text-accent" />
          </div>
          <div>
            <CardTitle>Create Assignment</CardTitle>
            <CardDescription>Design a new assignment with auto-grading</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Assignment Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Data Structures Quiz"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Year and Class Selection */}
          <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-4 w-4 text-primary" />
              <Label className="font-medium">Target Students</Label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="year">Select Year *</Label>
                <Select value={selectedYear} onValueChange={handleYearChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose year first" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Year 1 (1st Year)</SelectItem>
                    <SelectItem value="2">Year 2 (2nd Year)</SelectItem>
                    <SelectItem value="3">Year 3 (3rd Year)</SelectItem>
                    <SelectItem value="4">Year 4 (4th Year)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="class">Select Class *</Label>
                <Select 
                  value={classID} 
                  onValueChange={setClassID}
                  disabled={!selectedYear}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedYear ? "Select class" : "Select year first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableClasses.map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Scheduling Options */}
          <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <Label className="font-medium">Schedule Assignment</Label>
              </div>
              <Switch
                checked={scheduleEnabled}
                onCheckedChange={setScheduleEnabled}
              />
            </div>
            {scheduleEnabled ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">Push to Students At</Label>
                  <Input
                    id="scheduledDate"
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  The assignment will be automatically pushed to Year {selectedYear || '?'} students at this time.
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Send className="h-4 w-4" />
                Assignment will be published immediately after creation.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the assignment"
              rows={2}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Questions</Label>
              <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>

            {questions.map((question, qIndex) => (
              <div key={qIndex} className="p-4 border border-border rounded-lg space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Question Type</Label>
                        <Select
                          value={question.type}
                          onValueChange={(value: any) => updateQuestion(qIndex, 'type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                            <SelectItem value="fill-blank">Fill in the Blank</SelectItem>
                            <SelectItem value="short-answer">Short Answer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Points</Label>
                        <Input
                          type="number"
                          value={question.points}
                          onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value))}
                          min="1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Question</Label>
                      <Textarea
                        value={question.question}
                        onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                        placeholder="Enter your question"
                        rows={2}
                      />
                    </div>

                    {question.type === 'multiple-choice' && (
                      <div className="space-y-2">
                        <Label>Options</Label>
                        {question.options?.map((option, oIndex) => (
                          <Input
                            key={oIndex}
                            value={option}
                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                            placeholder={`Option ${oIndex + 1}`}
                          />
                        ))}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Correct Answer</Label>
                      <Input
                        value={question.correctAnswer}
                        onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                        placeholder="Enter the correct answer"
                      />
                    </div>
                  </div>

                  {questions.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeQuestion(qIndex)}
                      className="border-destructive/20 hover:bg-destructive/10 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full">
            {scheduleEnabled ? (
              <>
                <Clock className="h-4 w-4 mr-2" />
                Schedule Assignment
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Create & Publish Assignment
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
