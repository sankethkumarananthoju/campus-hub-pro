import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, subject, difficulty, questionCount, questionTypes } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`Generating ${questionCount} questions for ${subject} - ${topic} (${difficulty})`);

    const systemPrompt = `You are VINSA, an expert educational AI assistant specialized in creating high-quality academic questions. 
Your task is to generate exam-style questions for college/university students.

IMPORTANT RULES:
1. Generate exactly ${questionCount} questions
2. Questions should be at ${difficulty} difficulty level
3. Question types to include: ${questionTypes.join(', ')}
4. Subject: ${subject}
5. Topic: ${topic}

For each question, provide:
- A clear, unambiguous question text
- For multiple-choice: exactly 4 options with one correct answer
- For fill-blank: the exact answer that fills the blank (use ___ in the question)
- For short-answer: a model answer (2-3 sentences)
- Points based on difficulty: easy=5, medium=10, hard=15

Return ONLY a valid JSON array with this exact structure:
[
  {
    "type": "multiple-choice" | "fill-blank" | "short-answer",
    "question": "question text",
    "options": ["A", "B", "C", "D"] (only for multiple-choice),
    "correctAnswer": "correct answer",
    "points": number,
    "difficulty": "${difficulty}",
    "topic": "${topic}"
  }
]`;

    const userPrompt = `Generate ${questionCount} ${difficulty} difficulty ${questionTypes.join(' and ')} questions about "${topic}" in ${subject}.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Usage limit reached. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse the JSON from the response
    let questions;
    try {
      // Try to extract JSON from the response (might be wrapped in markdown code blocks)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        questions = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse questions from AI response');
    }

    // Add unique IDs to each question
    const questionsWithIds = questions.map((q: any, index: number) => ({
      ...q,
      id: `Q${Date.now()}_${index}`,
    }));

    console.log(`Successfully generated ${questionsWithIds.length} questions`);

    return new Response(JSON.stringify({ questions: questionsWithIds }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-questions:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to generate questions' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
