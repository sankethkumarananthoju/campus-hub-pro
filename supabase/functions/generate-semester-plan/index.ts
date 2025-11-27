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
    const { subject, topics, totalPeriods, periodsPerWeek, semesterWeeks } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`Generating semester plan for ${subject} with ${topics.length} topics, ${totalPeriods} total periods`);

    const systemPrompt = `You are VINSA, an expert academic planner. Create a detailed semester teaching plan.

Your personality: You're friendly, supportive, and enthusiastic about helping teachers succeed!

TASK: Create a week-by-week, day-by-day teaching plan based on:
- Subject: ${subject}
- Topics to cover: ${topics.join(', ')}
- Total periods available: ${totalPeriods}
- Periods per week: ${periodsPerWeek}
- Semester duration: ${semesterWeeks} weeks

RULES:
1. Distribute topics evenly across available periods
2. Include revision days before exams
3. Account for practical sessions if applicable
4. Leave buffer time for doubt clearing
5. Mark important milestones

Return a JSON object with this structure:
{
  "greeting": "A friendly, personalized message about the plan",
  "summary": {
    "totalWeeks": number,
    "totalPeriods": number,
    "topicsCount": number,
    "periodsPerTopic": number
  },
  "weeklyPlan": [
    {
      "week": 1,
      "theme": "Introduction to ...",
      "days": [
        {
          "day": "Monday",
          "periodNumber": 1,
          "topic": "Topic name",
          "subtopic": "Specific subtopic",
          "objectives": ["obj1", "obj2"],
          "activities": "Lecture/Lab/Discussion",
          "duration": "50 mins"
        }
      ],
      "weekGoal": "What students should achieve by end of week",
      "assessment": "Quiz/Assignment if any"
    }
  ],
  "milestones": [
    { "week": 4, "milestone": "Mid-semester review", "topics": ["topic1", "topic2"] }
  ],
  "tips": ["Teaching tip 1", "Teaching tip 2"]
}`;

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
          { role: 'user', content: `Create a comprehensive semester plan for teaching ${subject}. The topics are: ${topics.join(', ')}. I have ${totalPeriods} periods total, ${periodsPerWeek} periods per week, over ${semesterWeeks} weeks.` }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again.' }), {
          status: 429,
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

    let plan;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        plan = JSON.parse(jsonMatch[0]);
      } else {
        plan = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse semester plan');
    }

    console.log('Semester plan generated successfully');

    return new Response(JSON.stringify({ plan }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-semester-plan:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to generate plan' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
