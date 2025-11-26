import { Question, Submission } from '@/types';

export function autoGradeAssignment(
  studentAnswers: Record<string, string>,
  questions: Question[]
): Pick<Submission, 'score' | 'maxScore' | 'percentage' | 'feedback'> {
  let score = 0;
  const maxScore = questions.reduce((sum, q) => sum + q.points, 0);
  const feedback: Record<string, { correct: boolean; correctAnswer: string }> = {};

  questions.forEach(question => {
    const studentAnswer = (studentAnswers[question.id] || '').trim().toLowerCase();
    const correctAnswer = question.correctAnswer.trim().toLowerCase();
    
    let isCorrect = false;

    if (question.type === 'multiple-choice') {
      isCorrect = studentAnswer === correctAnswer;
    } else if (question.type === 'fill-blank') {
      // More lenient matching for fill-in-the-blank
      isCorrect = studentAnswer.includes(correctAnswer) || correctAnswer.includes(studentAnswer);
    } else if (question.type === 'short-answer') {
      // For short answers, check for key terms
      const keywords = correctAnswer.split(' ');
      isCorrect = keywords.some(keyword => studentAnswer.includes(keyword));
    }

    if (isCorrect) {
      score += question.points;
    }

    feedback[question.id] = {
      correct: isCorrect,
      correctAnswer: question.correctAnswer
    };
  });

  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  return {
    score,
    maxScore,
    percentage,
    feedback
  };
}
