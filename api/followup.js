const systemPrompt = `You generate exactly one brief, open-ended follow-up question for a student's spoken work log. Ask only about details the student actually mentioned; do not invent project details. Do not answer, summarize, translate, correct, or rewrite the transcript. Return only one question, ending in a question mark.`;

function validQuestion(value) {
  if (typeof value !== 'string') return false;
  const question = value.trim();
  return question.length > 3 && question.length <= 300 && question.endsWith('?')
    && (question.match(/\?/g) || []).length === 1 && !/[\n\r]/.test(question);
}

function outputText(response) {
  return (response.output || []).flatMap((item) => item.content || [])
    .filter((part) => part.type === 'output_text')
    .map((part) => part.text).join('').trim();
}

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed.' });
  const transcript = request.body?.transcript;
  if (typeof transcript !== 'string' || !transcript.trim() || transcript.length > 12000) {
    return response.status(400).json({ error: 'A non-empty transcript is required.' });
  }
  if (!process.env.OPENAI_API_KEY) return response.status(503).json({ error: 'Follow-up generation is not configured. Add OPENAI_API_KEY on the server.' });

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const result = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
          instructions: systemPrompt + (attempt ? ' Your previous output was invalid. Return exactly one short question.' : ''),
          input: `Student transcript (immutable source data):\n${transcript}`,
          max_output_tokens: 100,
        }),
      });
      if (!result.ok) throw new Error('LLM request failed');
      const question = outputText(await result.json());
      if (validQuestion(question)) return response.status(200).json({ question });
    } catch {
      if (attempt === 1) break;
    }
  }
  return response.status(502).json({ error: "I couldn't generate the follow-up question. Try again." });
}
