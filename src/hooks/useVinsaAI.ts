import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { QuestionBankItem } from '@/types';

interface GenerateQuestionsParams {
  topic: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  questionTypes: ('multiple-choice' | 'fill-blank' | 'short-answer')[];
}

interface UseVinsaAIReturn {
  isLoading: boolean;
  error: string | null;
  generateQuestions: (params: GenerateQuestionsParams) => Promise<QuestionBankItem[]>;
}

export function useVinsaAI(): UseVinsaAIReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQuestions = async (params: GenerateQuestionsParams): Promise<QuestionBankItem[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('generate-questions', {
        body: params,
      });

      if (functionError) {
        throw new Error(functionError.message || 'Failed to generate questions');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.questions || !Array.isArray(data.questions)) {
        throw new Error('Invalid response from AI');
      }

      // Transform the response into QuestionBankItem format
      const questions: QuestionBankItem[] = data.questions.map((q: any) => ({
        id: q.id || `Q${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        subject: params.subject,
        topic: params.topic,
        question: q.question,
        type: q.type,
        options: q.options,
        correctAnswer: q.correctAnswer,
        difficulty: q.difficulty || params.difficulty,
        points: q.points || (params.difficulty === 'easy' ? 5 : params.difficulty === 'medium' ? 10 : 15),
        createdAt: new Date(),
        source: 'ai' as const,
      }));

      return questions;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate questions';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    generateQuestions,
  };
}
