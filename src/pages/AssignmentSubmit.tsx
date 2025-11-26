import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { autoGradeAssignment } from '@/utils/grading';
import { ArrowLeft, Send, Trophy, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AssignmentSubmit() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const { assignments, addSubmission, currentUserID, currentUserName } = useApp();
  const { toast } = useToast();

  const assignment = assignments.find(a => a.id === assignmentId);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!assignment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Assignment Not Found</h1>
          <Button onClick={() => navigate('/')}>Go Back</Button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if all questions are answered
    const unanswered = assignment.questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      toast({
        title: 'Incomplete Submission',
        description: `Please answer all ${assignment.questions.length} questions`,
        variant: 'destructive'
      });
      return;
    }

    // Auto-grade the assignment
    const gradingResult = autoGradeAssignment(answers, assignment.questions);

    // Save submission
    const submission = {
      assignmentID: assignment.id,
      studentID: currentUserID,
      studentName: currentUserName,
      studentAnswers: answers,
      ...gradingResult
    };

    addSubmission(submission);
    setResult({ ...gradingResult, studentAnswers: answers });
    setSubmitted(true);

    toast({
      title: 'Assignment Submitted!',
      description: `You scored ${gradingResult.percentage}% (${gradingResult.score}/${gradingResult.maxScore} points)`,
    });
  };

  if (submitted && result) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 max-w-4xl space-y-6">
          <Button variant="outline" onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>

          <Card className="border-2 border-success/20">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto p-3 bg-success/10 rounded-full w-fit mb-4">
                <Trophy className="h-8 w-8 text-success" />
              </div>
              <CardTitle className="text-2xl">Assignment Submitted!</CardTitle>
              <CardDescription>Your work has been auto-graded</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-6 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Your Score</p>
                <p className="text-5xl font-bold text-foreground mb-2">{result.percentage}%</p>
                <p className="text-muted-foreground">{result.score} out of {result.maxScore} points</p>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Detailed Feedback</h3>
                {assignment.questions.map((question, index) => {
                  const feedback = result.feedback[question.id];
                  const isCorrect = feedback.correct;

                  return (
                    <div key={question.id} className={`p-4 rounded-lg border ${isCorrect ? 'border-success/20 bg-success/5' : 'border-destructive/20 bg-destructive/5'}`}>
                      <div className="flex items-start gap-3">
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                        )}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">Question {index + 1}</span>
                            <Badge variant={isCorrect ? 'default' : 'destructive'} className={isCorrect ? 'bg-success' : ''}>
                              {isCorrect ? `+${question.points}` : '0'} pts
                            </Badge>
                          </div>
                          <p className="text-sm text-foreground">{question.question}</p>
                          <div className="text-sm space-y-1">
                            <p><span className="text-muted-foreground">Your answer:</span> <span className="font-medium">{result.studentAnswers[question.id]}</span></p>
                            {!isCorrect && (
                              <p><span className="text-muted-foreground">Correct answer:</span> <span className="font-medium text-success">{feedback.correctAnswer}</span></p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button className="w-full" onClick={() => navigate('/')}>
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-4xl space-y-6">
        <Button variant="outline" onClick={() => navigate('/')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{assignment.title}</CardTitle>
            <CardDescription>{assignment.description}</CardDescription>
            <div className="flex gap-4 text-sm text-muted-foreground pt-2">
              <span>{assignment.questions.length} questions</span>
              <span>•</span>
              <span>{assignment.totalPoints} total points</span>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {assignment.questions.map((question, index) => (
                <div key={question.id} className="p-6 border border-border rounded-lg space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <Label className="text-base font-semibold">
                        Question {index + 1}
                      </Label>
                      <p className="text-foreground mt-2">{question.question}</p>
                    </div>
                    <Badge variant="secondary">{question.points} pts</Badge>
                  </div>

                  {question.type === 'multiple-choice' && question.options && (
                    <RadioGroup
                      value={answers[question.id] || ''}
                      onValueChange={(value) => setAnswers({ ...answers, [question.id]: value })}
                    >
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50">
                          <RadioGroupItem value={option} id={`${question.id}-${oIndex}`} />
                          <Label htmlFor={`${question.id}-${oIndex}`} className="flex-1 cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {(question.type === 'fill-blank' || question.type === 'short-answer') && (
                    <Input
                      value={answers[question.id] || ''}
                      onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                      placeholder="Type your answer here"
                      className="mt-2"
                    />
                  )}
                </div>
              ))}

              <Button type="submit" className="w-full gap-2" size="lg">
                <Send className="h-4 w-4" />
                Submit Assignment & Get Results
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
