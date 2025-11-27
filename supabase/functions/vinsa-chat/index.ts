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
    const { message, context } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`VINSA chat: "${message.substring(0, 50)}..."`);

    // Parse context data if available
    let contextInfo = '';
    try {
      const contextData = context ? JSON.parse(context) : null;
      if (contextData) {
        const { pendingRequests, performanceByYear, totalSubmissions, totalAssignments } = contextData;
        
        if (pendingRequests && pendingRequests.length > 0) {
          contextInfo += `\n\nPENDING PASS REQUESTS (${pendingRequests.length} total):\n`;
          pendingRequests.forEach((req: any, i: number) => {
            contextInfo += `${i + 1}. ${req.studentName} - "${req.reason}" (requested: ${new Date(req.requestedTime).toLocaleString()})\n`;
          });
        } else {
          contextInfo += '\n\nNo pending pass requests at the moment.';
        }
        
        if (performanceByYear && Object.keys(performanceByYear).length > 0) {
          contextInfo += '\n\nSTUDENT PERFORMANCE BY YEAR:\n';
          Object.entries(performanceByYear).forEach(([year, data]: [string, any]) => {
            contextInfo += `- Year ${year}: Average score ${data.avgScore}% across ${data.submissions} submissions\n`;
          });
        }
        
        contextInfo += `\n\nOVERALL: ${totalAssignments} assignments created, ${totalSubmissions} submissions received.`;
      }
    } catch (e) {
      contextInfo = context || 'General conversation';
    }

    const systemPrompt = `You are VINSA (Virtual Intelligent Smart Assistant), a friendly, playful, and helpful AI assistant for teachers and HODs in an educational institution.

YOUR PERSONALITY:
- You're warm, enthusiastic, and supportive like a helpful colleague
- You use casual, conversational language (but still professional)
- You can use expressions like "Hey!", "Sure thing!", "Absolutely!", "No worries!", "Got it!"
- You're encouraging and positive about teaching
- You occasionally use light humor
- You ask follow-up questions to understand needs better
- You remember context from the conversation

CAPABILITIES:
1. Generate exam questions on ANY topic
2. Create semester teaching plans
3. Help with syllabus organization
4. Provide teaching tips and strategies
5. Assist with timetable planning
6. Answer general education-related queries
7. Report on pending student pass requests
8. Provide student performance analytics by year

RESPONSE STYLE:
- Keep responses concise but friendly
- Use bullet points for lists
- Be specific and actionable
- If you don't know something, admit it cheerfully
- Always offer to help with more

CURRENT DATA:${contextInfo}

Remember: You're not just an AI - you're a supportive teaching companion! 🎓`;

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
          { role: 'user', content: message }
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

    console.log('VINSA response generated');

    return new Response(JSON.stringify({ response: content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in vinsa-chat:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Something went wrong!' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
