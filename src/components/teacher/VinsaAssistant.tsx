import { useState, useEffect, useRef } from 'react';
import { VinsaAvatar } from './VinsaAvatar';
import { useVinsaAI } from '@/hooks/useVinsaAI';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { QuestionBankItem, VinsaChatMessage, Question } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Send, Sparkles, BookOpen, Save, Plus, CheckCircle, XCircle, Zap, Brain, Target, Volume2, VolumeX, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function VinsaAssistant() {
  const { subjectsByYear, addToQuestionBank, addAssignment, currentUserID, currentUserName } = useApp();
  const { isLoading, generateQuestions } = useVinsaAI();
  const { speak, stop, isSpeaking, isLoading: isSpeechLoading } = useTextToSpeech();
  const { toast } = useToast();

  const [messages, setMessages] = useState<VinsaChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hey there! 👋 I'm VINSA, your friendly AI teaching assistant! I can generate questions, help plan your semester, or just chat about anything education-related. How can I help you today?",
      timestamp: new Date(),
    },
  ]);

  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [questionTypes, setQuestionTypes] = useState<('multiple-choice' | 'fill-blank' | 'short-answer')[]>(['multiple-choice']);
  const [generatedQuestions, setGeneratedQuestions] = useState<QuestionBankItem[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change or when typing
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isChatting, isLoading]);

  const allSubjects = subjectsByYear.flatMap((y) => y.subjects);
  const filteredSubjects = selectedYear
    ? subjectsByYear.find((y) => y.year.toString() === selectedYear)?.subjects || []
    : allSubjects;

  const handleChat = async () => {
    if (!chatInput.trim()) return;

    const userMessage: VinsaChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: chatInput,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setChatInput('');
    setIsChatting(true);

    try {
      const { data, error } = await supabase.functions.invoke('vinsa-chat', {
        body: { message: chatInput, context: 'Teacher assistance' },
      });

      if (error) throw error;

      const assistantMessage: VinsaChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: data.response || "Hmm, I'm not sure how to respond to that. Could you rephrase?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Auto-play voice if enabled
      if (voiceEnabled && data.response) {
        speak(data.response);
      }
    } catch (err) {
      const errorMessage: VinsaChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: "Oops! Something went wrong on my end. Let me try again in a moment! 😅",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsChatting(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedSubject || !topic) {
      toast({
        title: 'Missing Information',
        description: 'Please select a subject and enter a topic.',
        variant: 'destructive',
      });
      return;
    }

    const userMessage: VinsaChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: `Generate ${questionCount} ${difficulty} ${questionTypes.join(' & ')} questions on "${topic}" in ${selectedSubject}`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const questions = await generateQuestions({
        topic,
        subject: selectedSubject,
        difficulty,
        questionCount,
        questionTypes,
      });

      setGeneratedQuestions(questions);
      setSelectedQuestions(new Set(questions.map((q) => q.id)));

      const responseText = `Awesome! 🎉 I've whipped up ${questions.length} questions for you on ${topic}! Take a look below and save the ones you love to your Question Bank.`;
      
      const assistantMessage: VinsaChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
        questions,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      if (voiceEnabled) {
        speak(responseText);
      }
    } catch (err) {
      const errorMessage: VinsaChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: `Oops! Hit a snag: ${err instanceof Error ? err.message : 'Unknown error'}. Let's try that again! 💪`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const playMessage = (text: string) => {
    if (isSpeaking) {
      stop();
    } else {
      speak(text);
    }
  };

  const toggleQuestionSelection = (id: string) => {
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

  const saveToQuestionBank = (question: QuestionBankItem) => {
    addToQuestionBank(question);
    toast({
      title: 'Saved! 🎯',
      description: 'Question added to your Question Bank.',
    });
  };

  const saveAllSelected = () => {
    const selected = generatedQuestions.filter((q) => selectedQuestions.has(q.id));
    selected.forEach((q) => addToQuestionBank(q));
    toast({
      title: 'All Saved! 🎉',
      description: `${selected.length} questions added to your Question Bank.`,
    });
  };

  const createAssignmentFromSelected = () => {
    const selected = generatedQuestions.filter((q) => selectedQuestions.has(q.id));
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

    addAssignment({
      teacherID: currentUserID,
      teacherName: currentUserName,
      classID: 'CS-2A',
      title: `${selectedSubject} - ${topic}`,
      description: `Auto-generated assignment on ${topic}`,
      questions: assignmentQuestions,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      totalPoints: assignmentQuestions.reduce((sum, q) => sum + q.points, 0),
    });

    toast({
      title: 'Assignment Created! 📚',
      description: `Assignment with ${selected.length} questions has been created.`,
    });
  };

  const toggleQuestionType = (type: 'multiple-choice' | 'fill-blank' | 'short-answer') => {
    setQuestionTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Panel - Configuration */}
      <div className="lg:col-span-1 space-y-4">
        {/* VINSA Header */}
        <div className="glass rounded-2xl p-6 vinsa-border-gradient">
          <div className="flex items-center gap-4">
            <VinsaAvatar size="lg" isThinking={isLoading || isChatting} />
            <div>
              <h2 className="text-2xl font-bold vinsa-gradient-text">VINSA</h2>
              <p className="text-sm text-muted-foreground">Your AI Teaching Buddy</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn('w-2 h-2 rounded-full', isLoading || isChatting ? 'bg-warning animate-pulse' : 'bg-success')} />
                <span className="text-xs text-muted-foreground">{isLoading || isChatting ? 'Thinking...' : 'Ready to help!'}</span>
              </div>
            </div>
          </div>
          
          {/* Voice Toggle */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
            <span className="text-sm text-muted-foreground">Voice Responses</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={cn(voiceEnabled ? 'text-vinsa-cyan' : 'text-muted-foreground')}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Target className="w-4 h-4 text-vinsa-cyan" />
            Generate Questions
          </h3>

          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Year (Optional)</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="glass border-0">
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
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
              <Label className="text-xs text-muted-foreground">Topic *</Label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Arrays, Linked Lists"
                className="glass border-0"
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Difficulty</Label>
              <div className="flex gap-2 mt-1">
                {(['easy', 'medium', 'hard'] as const).map((d) => (
                  <Button
                    key={d}
                    variant={difficulty === d ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDifficulty(d)}
                    className={cn(
                      'flex-1 capitalize',
                      difficulty === d && 'vinsa-gradient-bg border-vinsa-cyan'
                    )}
                  >
                    {d}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Question Count: {questionCount}</Label>
              <input
                type="range"
                min="1"
                max="15"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full accent-vinsa-cyan"
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Question Types</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {[
                  { type: 'multiple-choice' as const, icon: CheckCircle, label: 'MCQ' },
                  { type: 'fill-blank' as const, icon: BookOpen, label: 'Fill Blank' },
                  { type: 'short-answer' as const, icon: Brain, label: 'Short Answer' },
                ].map(({ type, icon: Icon, label }) => (
                  <Button
                    key={type}
                    variant={questionTypes.includes(type) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleQuestionType(type)}
                    className={cn(questionTypes.includes(type) && 'vinsa-gradient-bg border-vinsa-cyan')}
                  >
                    <Icon className="w-3 h-3 mr-1" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isLoading || !selectedSubject || !topic || questionTypes.length === 0}
            className="w-full bg-gradient-to-r from-vinsa-cyan to-vinsa-purple hover:opacity-90 text-primary-foreground"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate Questions
              </>
            )}
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="glass rounded-2xl p-4">
          <Label className="text-xs text-muted-foreground mb-2 block">Quick Generate</Label>
          <div className="flex flex-wrap gap-2">
            {[
              { label: '5 MCQs', count: 5, types: ['multiple-choice'] as ('multiple-choice' | 'fill-blank' | 'short-answer')[], diff: 'medium' as const },
              { label: '10 Mixed', count: 10, types: ['multiple-choice', 'fill-blank'] as ('multiple-choice' | 'fill-blank' | 'short-answer')[], diff: 'medium' as const },
              { label: 'Hard Quiz', count: 5, types: ['multiple-choice'] as ('multiple-choice' | 'fill-blank' | 'short-answer')[], diff: 'hard' as const },
            ].map((preset) => (
              <Button
                key={preset.label}
                variant="outline"
                size="sm"
                className="glass border-vinsa-cyan/30 hover:border-vinsa-cyan"
                onClick={() => {
                  setQuestionCount(preset.count);
                  setQuestionTypes(preset.types);
                  setDifficulty(preset.diff);
                }}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Chat & Results */}
      <div className="lg:col-span-2 space-y-4">
        {/* Chat Area */}
        <div className="glass rounded-2xl overflow-hidden vinsa-border-gradient">
          <ScrollArea className="h-[400px] p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && <VinsaAvatar size="sm" />}
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl p-4',
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-vinsa-cyan/20 to-vinsa-purple/20 text-foreground'
                        : 'glass'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                      {message.role === 'assistant' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => playMessage(message.content)}
                          className="h-6 px-2"
                          disabled={isSpeechLoading}
                        >
                          {isSpeaking ? (
                            <VolumeX className="w-3 h-3" />
                          ) : (
                            <Volume2 className="w-3 h-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {(isChatting || isLoading) && (
                <div className="flex gap-3 justify-start">
                  <VinsaAvatar size="sm" isThinking />
                  <div className="glass rounded-2xl p-4 flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-vinsa-cyan rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-vinsa-purple rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-vinsa-cyan rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm text-muted-foreground ml-2">VINSA is typing...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Chat Input */}
          <div className="p-4 border-t border-border/50">
            <div className="flex gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask me anything... (e.g., 'How are you?' or 'Help me plan my week')"
                className="glass border-0"
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleChat()}
              />
              <Button
                onClick={handleChat}
                disabled={isChatting || !chatInput.trim()}
                className="bg-gradient-to-r from-vinsa-cyan to-vinsa-purple"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Generated Questions */}
        {generatedQuestions.length > 0 && (
          <div className="glass rounded-2xl p-4 space-y-4 vinsa-border-gradient">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-vinsa-cyan" />
                Generated Questions ({generatedQuestions.length})
              </h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={saveAllSelected} className="glass">
                  <Save className="w-4 h-4 mr-1" />
                  Save Selected ({selectedQuestions.size})
                </Button>
                <Button size="sm" onClick={createAssignmentFromSelected} className="bg-gradient-to-r from-vinsa-cyan to-vinsa-purple">
                  <Plus className="w-4 h-4 mr-1" />
                  Create Assignment
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[250px]">
              <div className="space-y-3">
                {generatedQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className={cn(
                      'glass rounded-xl p-4 cursor-pointer transition-all',
                      selectedQuestions.has(q.id)
                        ? 'vinsa-border-gradient vinsa-glow'
                        : 'hover:bg-muted/50'
                    )}
                    onClick={() => toggleQuestionSelection(q.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            Q{idx + 1}
                          </Badge>
                          <Badge
                            className={cn(
                              'text-xs',
                              q.type === 'multiple-choice' && 'bg-vinsa-cyan/20 text-vinsa-cyan',
                              q.type === 'fill-blank' && 'bg-vinsa-purple/20 text-vinsa-purple',
                              q.type === 'short-answer' && 'bg-accent/20 text-accent'
                            )}
                          >
                            {q.type}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {q.points} pts
                          </Badge>
                        </div>
                        <p className="text-sm font-medium">{q.question}</p>
                        {q.options && (
                          <div className="mt-2 grid grid-cols-2 gap-1">
                            {q.options.map((opt, i) => (
                              <span
                                key={i}
                                className={cn(
                                  'text-xs px-2 py-1 rounded',
                                  opt === q.correctAnswer
                                    ? 'bg-success/20 text-success'
                                    : 'bg-muted'
                                )}
                              >
                                {String.fromCharCode(65 + i)}. {opt}
                              </span>
                            ))}
                          </div>
                        )}
                        {!q.options && (
                          <p className="text-xs text-success mt-1">
                            Answer: {q.correctAnswer}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        {selectedQuestions.has(q.id) ? (
                          <CheckCircle className="w-5 h-5 text-success" />
                        ) : (
                          <XCircle className="w-5 h-5 text-muted-foreground" />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            saveToQuestionBank(q);
                          }}
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}
