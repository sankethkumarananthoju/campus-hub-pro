import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { QuestionBankItem, Question } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Search, Trash2, Plus, Filter, BookOpen, CheckCircle, Brain, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function QuestionBankViewer() {
  const { questionBank, removeFromQuestionBank, subjectsByYear, addAssignment, currentUserID, currentUserName } = useApp();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());

  const allSubjects = [...new Set(questionBank.map((q) => q.subject))];

  const filteredQuestions = questionBank.filter((q) => {
    const matchesSearch =
      searchQuery === '' ||
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject === 'all' || q.subject === filterSubject;
    const matchesDifficulty = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
    const matchesType = filterType === 'all' || q.type === filterType;
    return matchesSearch && matchesSubject && matchesDifficulty && matchesType;
  });

  const toggleSelection = (id: string) => {
    setSelectedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedQuestions(new Set(filteredQuestions.map((q) => q.id)));
  };

  const clearSelection = () => {
    setSelectedQuestions(new Set());
  };

  const deleteSelected = () => {
    selectedQuestions.forEach((id) => removeFromQuestionBank(id));
    setSelectedQuestions(new Set());
    toast({
      title: 'Deleted',
      description: `${selectedQuestions.size} questions removed from Question Bank.`,
    });
  };

  const createAssignmentFromSelected = () => {
    const selected = questionBank.filter((q) => selectedQuestions.has(q.id));
    if (selected.length === 0) {
      toast({
        title: 'No Questions Selected',
        description: 'Please select at least one question.',
        variant: 'destructive',
      });
      return;
    }

    const assignmentQuestions: Question[] = selected.map((q) => ({
      id: q.id,
      type: q.type,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      points: q.points,
    }));

    const subjects = [...new Set(selected.map((q) => q.subject))];
    const topics = [...new Set(selected.map((q) => q.topic))];

    addAssignment({
      teacherID: currentUserID,
      teacherName: currentUserName,
      classID: 'CS-2A',
      title: `${subjects.join(', ')} - ${topics.slice(0, 2).join(', ')}${topics.length > 2 ? '...' : ''}`,
      description: `Assignment created from Question Bank`,
      questions: assignmentQuestions,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      totalPoints: assignmentQuestions.reduce((sum, q) => sum + q.points, 0),
    });

    toast({
      title: 'Assignment Created!',
      description: `Assignment with ${selected.length} questions has been created.`,
    });
    setSelectedQuestions(new Set());
  };

  const stats = {
    total: questionBank.length,
    mcq: questionBank.filter((q) => q.type === 'multiple-choice').length,
    fillBlank: questionBank.filter((q) => q.type === 'fill-blank').length,
    shortAnswer: questionBank.filter((q) => q.type === 'short-answer').length,
    aiGenerated: questionBank.filter((q) => q.source === 'ai').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: BookOpen, color: 'text-primary' },
          { label: 'MCQ', value: stats.mcq, icon: CheckCircle, color: 'text-vinsa-cyan' },
          { label: 'Fill Blank', value: stats.fillBlank, icon: BookOpen, color: 'text-vinsa-purple' },
          { label: 'Short Answer', value: stats.shortAnswer, icon: Brain, color: 'text-accent' },
          { label: 'AI Generated', value: stats.aiGenerated, icon: Sparkles, color: 'text-success' },
        ].map((stat) => (
          <Card key={stat.label} className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <stat.icon className={cn('w-4 h-4', stat.color)} />
                <span className="text-2xl font-bold">{stat.value}</span>
              </div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="glass vinsa-border-gradient">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-4 h-4 text-vinsa-cyan" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 glass border-0"
              />
            </div>

            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger className="glass border-0">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {allSubjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
              <SelectTrigger className="glass border-0">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="glass border-0">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                <SelectItem value="fill-blank">Fill in Blank</SelectItem>
                <SelectItem value="short-answer">Short Answer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={selectAll} className="glass">
            Select All ({filteredQuestions.length})
          </Button>
          <Button variant="outline" size="sm" onClick={clearSelection} className="glass">
            Clear Selection
          </Button>
          {selectedQuestions.size > 0 && (
            <Badge className="bg-vinsa-cyan/20 text-vinsa-cyan">
              {selectedQuestions.size} selected
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedQuestions.size > 0 && (
            <>
              <Button
                variant="destructive"
                size="sm"
                onClick={deleteSelected}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
              <Button
                size="sm"
                onClick={createAssignmentFromSelected}
                className="bg-gradient-to-r from-vinsa-cyan to-vinsa-purple"
              >
                <Plus className="w-4 h-4 mr-1" />
                Create Assignment
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <Card className="glass">
          <CardContent className="p-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg">No Questions Found</h3>
            <p className="text-muted-foreground">
              {questionBank.length === 0
                ? 'Your Question Bank is empty. Use VINSA to generate questions!'
                : 'No questions match your filters.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[500px]">
          <div className="space-y-3">
            {filteredQuestions.map((q, idx) => (
              <Card
                key={q.id}
                className={cn(
                  'glass cursor-pointer transition-all',
                  selectedQuestions.has(q.id)
                    ? 'vinsa-border-gradient vinsa-glow'
                    : 'hover:bg-muted/50'
                )}
                onClick={() => toggleSelection(q.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant="outline">{q.subject}</Badge>
                        <Badge variant="secondary">{q.topic}</Badge>
                        <Badge
                          className={cn(
                            q.type === 'multiple-choice' && 'bg-vinsa-cyan/20 text-vinsa-cyan',
                            q.type === 'fill-blank' && 'bg-vinsa-purple/20 text-vinsa-purple',
                            q.type === 'short-answer' && 'bg-accent/20 text-accent'
                          )}
                        >
                          {q.type}
                        </Badge>
                        <Badge
                          className={cn(
                            q.difficulty === 'easy' && 'bg-success/20 text-success',
                            q.difficulty === 'medium' && 'bg-warning/20 text-warning',
                            q.difficulty === 'hard' && 'bg-destructive/20 text-destructive'
                          )}
                        >
                          {q.difficulty}
                        </Badge>
                        <Badge variant="outline">{q.points} pts</Badge>
                        {q.source === 'ai' && (
                          <Badge className="bg-vinsa-cyan/20 text-vinsa-cyan">
                            <Sparkles className="w-3 h-3 mr-1" />
                            AI
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium">{q.question}</p>
                      {q.options && (
                        <div className="mt-2 grid grid-cols-2 gap-1">
                          {q.options.map((opt, i) => (
                            <span
                              key={i}
                              className={cn(
                                'text-sm px-2 py-1 rounded',
                                opt === q.correctAnswer ? 'bg-success/20 text-success' : 'bg-muted'
                              )}
                            >
                              {String.fromCharCode(65 + i)}. {opt}
                            </span>
                          ))}
                        </div>
                      )}
                      {!q.options && (
                        <p className="text-sm text-success mt-2">Answer: {q.correctAnswer}</p>
                      )}
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      {selectedQuestions.has(q.id) ? (
                        <CheckCircle className="w-6 h-6 text-success" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30" />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromQuestionBank(q.id);
                          toast({ title: 'Deleted', description: 'Question removed.' });
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
