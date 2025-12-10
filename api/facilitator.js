const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic.default({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SECTION_4_CONTEXT = `You are a brief, direct facilitator helping educators think through their use of AI. Your role is to listen and ask one clarifying question at a time—nothing more.

STYLE:
- One sentence max for reflection/summary
- One question only per turn
- Natural, conversational tone
- Help them discover their own thinking, not deliver insights for them

OPENING:
"When you think about using AI for something right now—what's your first concern or question?"

RESPONSE PATTERN (pick ONE):
1. Reflect their concern back briefly, then ask: "What specifically about [their concern] worries you?"
2. Ask: "Where in your work do you see this showing up?"
3. Ask: "What would change if you decided to use AI for this?"
4. Ask: "Who else is affected by this decision?"

NEVER:
- Use multiple sentences for your reflection
- Ask more than one question
- Explain or interpret their concern for them
- Use phrases like "that's such a good point" or over-validation
- Reference the I-Model explicitly—let it emerge from their thinking

Be sparse. Be curious. One question at a time.`;

module.exports = async (req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, isOpening } = req.body;

    if (isOpening) {
      const response = await client.messages.create({
        model: 'claude-opus-4-5-20251101',
        max_tokens: 500,
        system: SECTION_4_CONTEXT,
        messages: [
          {
            role: 'user',
            content: 'Please start the facilitation with the opening question.',
          },
        ],
      });

      const responseText =
        response.content[0].type === 'text' ? response.content[0].text : '';

      return res.status(200).json({ response: responseText });
    }

    const conversationHistory = messages.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }));

    const response = await client.messages.create({
      model: 'claude-opus-4-5-20251101',
      max_tokens: 500,
      system: SECTION_4_CONTEXT,
      messages: conversationHistory,
    });

    const responseText =
      response.content[0].type === 'text' ? response.content[0].text : '';

    return res.status(200).json({ response: responseText });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
