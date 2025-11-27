import { useState } from 'react';
import { VinsaAvatar } from './VinsaAvatar';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Calendar, BookOpen, Target, CheckCircle, Sparkles, Download, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DayPlan {
  day: string;
  periodNumber: number;
  topic: string;
  subtopic: string;
  objectives: string[];
  activities: string;
  duration: string;
  completed?: boolean;
}

interface WeekPlan {
  week: number;
  theme: string;
  days: DayPlan[];
  weekGoal: string;
  assessment?: string;
}

interface SemesterPlan {
  greeting: string;
  summary: {
    totalWeeks: number;
    totalPeriods: number;
    topicsCount: number;
    periodsPerTopic: number;
  };
  weeklyPlan: WeekPlan[];
  milestones: { week: number; milestone: string; topics: string[] }[];
  tips: string[];
}

export function SemesterPlanner() {
  const { subjectsByYear } = useApp();
  const { toast } = useToast();

  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [topicsInput, setTopicsInput] = useState('');
  const [totalPeriods, setTotalPeriods] = useState(60);
  const [periodsPerWeek, setPeriodsPerWeek] = useState(4);
  const [semesterWeeks, setSemesterWeeks] = useState(16);
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<SemesterPlan | null>(null);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]));
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  const filteredSubjects = selectedYear
    ? subjectsByYear.find((y) => y.year.toString() === selectedYear)?.subjects || []
    : subjectsByYear.flatMap((y) => y.subjects);

  const handleGeneratePlan = async () => {
    const topics = topicsInput.split('\n').filter((t) => t.trim());

    if (!selectedSubject || topics.length === 0) {
      toast({
        title: 'Missing Information',
        description: 'Please select a subject and enter topics.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-semester-plan', {
        body: {
          subject: selectedSubject,
          topics,
          totalPeriods,
          periodsPerWeek,
          semesterWeeks,
        },
      });

      if (error) throw error;

      if (data?.plan) {
        setPlan(data.plan);
        setExpandedWeeks(new Set([1]));
        toast({
          title: 'Plan Generated!',
          description: 'Your semester plan is ready. Review and customize as needed.',
        });
      }
    } catch (err) {
      console.error('Error generating plan:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to generate plan',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWeekExpanded = (week: number) => {
    setExpandedWeeks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(week)) {
        newSet.delete(week);
      } else {
        newSet.add(week);
      }
      return newSet;
    });
  };

  const toggleCompleted = (id: string) => {
    setCompletedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getCompletionPercentage = () => {
    if (!plan) return 0;
    const totalItems = plan.weeklyPlan.reduce((sum, w) => sum + w.days.length, 0);
    return totalItems > 0 ? Math.round((completedItems.size / totalItems) * 100) : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-6 vinsa-border-gradient">
        <div className="flex items-center gap-4">
          <VinsaAvatar size="lg" isThinking={isLoading} />
          <div>
            <h2 className="text-2xl font-bold vinsa-gradient-text">Semester Planner</h2>
            <p className="text-sm text-muted-foreground">
              Let me help you create a detailed teaching plan for the entire semester!
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-4">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-4 h-4 text-vinsa-cyan" />
                Plan Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="glass border-0">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        Year {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Subject *</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="glass border-0">
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSubjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Topics (one per line) *</Label>
                <Textarea
                  value={topicsInput}
                  onChange={(e) => setTopicsInput(e.target.value)}
                  placeholder="Introduction to Arrays&#10;Array Operations&#10;Multi-dimensional Arrays&#10;..."
                  className="glass border-0 min-h-[120px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Total Periods</Label>
                  <Input
                    type="number"
                    value={totalPeriods}
                    onChange={(e) => setTotalPeriods(Number(e.target.value))}
                    className="glass border-0"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Periods/Week</Label>
                  <Input
                    type="number"
                    value={periodsPerWeek}
                    onChange={(e) => setPeriodsPerWeek(Number(e.target.value))}
                    className="glass border-0"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Semester Weeks</Label>
                <Input
                  type="number"
                  value={semesterWeeks}
                  onChange={(e) => setSemesterWeeks(Number(e.target.value))}
                  className="glass border-0"
                />
              </div>

              <Button
                onClick={handleGeneratePlan}
                disabled={isLoading || !selectedSubject || !topicsInput.trim()}
                className="w-full bg-gradient-to-r from-vinsa-cyan to-vinsa-purple"
              >
                {isLoading ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Generating Plan...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 mr-2" />
                    Generate Semester Plan
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Plan Display */}
        <div className="lg:col-span-2 space-y-4">
          {plan ? (
            <>
              {/* Summary */}
              <Card className="glass vinsa-border-gradient">
                <CardContent className="p-4">
                  <p className="text-sm mb-4">{plan.greeting}</p>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <span className="text-2xl font-bold text-vinsa-cyan">{plan.summary.totalWeeks}</span>
                      <p className="text-xs text-muted-foreground">Weeks</p>
                    </div>
                    <div className="text-center">
                      <span className="text-2xl font-bold text-vinsa-purple">{plan.summary.totalPeriods}</span>
                      <p className="text-xs text-muted-foreground">Periods</p>
                    </div>
                    <div className="text-center">
                      <span className="text-2xl font-bold text-accent">{plan.summary.topicsCount}</span>
                      <p className="text-xs text-muted-foreground">Topics</p>
                    </div>
                    <div className="text-center">
                      <span className="text-2xl font-bold text-success">{getCompletionPercentage()}%</span>
                      <p className="text-xs text-muted-foreground">Complete</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Plans */}
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {plan.weeklyPlan.map((week) => (
                    <Card key={week.week} className="glass">
                      <CardHeader
                        className="cursor-pointer py-3"
                        onClick={() => toggleWeekExpanded(week.week)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {expandedWeeks.has(week.week) ? (
                              <ChevronDown className="w-4 h-4 text-vinsa-cyan" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            )}
                            <div>
                              <CardTitle className="text-base">Week {week.week}</CardTitle>
                              <CardDescription>{week.theme}</CardDescription>
                            </div>
                          </div>
                          <Badge variant="outline">{week.days.length} periods</Badge>
                        </div>
                      </CardHeader>

                      {expandedWeeks.has(week.week) && (
                        <CardContent className="pt-0 space-y-3">
                          {week.days.map((day, idx) => {
                            const itemId = `w${week.week}-d${idx}`;
                            const isCompleted = completedItems.has(itemId);

                            return (
                              <div
                                key={idx}
                                className={cn(
                                  'glass rounded-lg p-3 transition-all',
                                  isCompleted && 'opacity-60'
                                )}
                              >
                                <div className="flex items-start gap-3">
                                  <Checkbox
                                    checked={isCompleted}
                                    onCheckedChange={() => toggleCompleted(itemId)}
                                    className="mt-1"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge className="bg-vinsa-cyan/20 text-vinsa-cyan text-xs">
                                        {day.day}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        Period {day.periodNumber}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        {day.duration}
                                      </span>
                                    </div>
                                    <p className={cn('font-medium', isCompleted && 'line-through')}>
                                      {day.topic}
                                    </p>
                                    {day.subtopic && (
                                      <p className="text-sm text-muted-foreground">{day.subtopic}</p>
                                    )}
                                    <Badge variant="secondary" className="mt-1 text-xs">
                                      {day.activities}
                                    </Badge>
                                  </div>
                                  {isCompleted && (
                                    <CheckCircle className="w-5 h-5 text-success" />
                                  )}
                                </div>
                              </div>
                            );
                          })}

                          {week.weekGoal && (
                            <div className="bg-muted/50 rounded-lg p-3">
                              <p className="text-sm">
                                <strong>Week Goal:</strong> {week.weekGoal}
                              </p>
                              {week.assessment && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  <strong>Assessment:</strong> {week.assessment}
                                </p>
                              )}
                            </div>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </ScrollArea>

              {/* Tips */}
              {plan.tips && plan.tips.length > 0 && (
                <Card className="glass">
                  <CardHeader className="py-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-vinsa-cyan" />
                      Teaching Tips from VINSA
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-1">
                      {plan.tips.map((tip, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-vinsa-cyan">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="glass">
              <CardContent className="p-12 text-center">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg">No Plan Yet</h3>
                <p className="text-muted-foreground">
                  Configure your semester details and let me create a comprehensive teaching plan!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
