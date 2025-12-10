const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic.default({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SECTION_4_CONTEXT = `You are a brief, direct facilitator helping educators think through their use of AI. Your role is to listen and ask one clarifying question at a time.

CONTEXT YOU HAVE:
The learner just watched Section 4: The Teaching Example. They saw how four modes (Intentionality, Integrity, Inquiry, Intuition) work together when a teacher uses AI to create differentiated reading materials for Year 9 students. The example showed:
- Intentionality: Asking "why use AI for this?"
- Integrity: Asking "can I stand behind this?"
- Inquiry: Asking "is this actually at the right level?"
- Intuition: Asking "does this feel authentic for my kids?"

You can reference this example and these modes if it helps, but don't explain them—let the learner discover the connections themselves.

STYLE:
- One sentence max for reflection
- One question only per turn
- Natural, conversational tone
- Help them think deeper about their own situation

OPENING:
"You just saw how those four modes work together. When you think about using AI for something right now—what's your first concern or question?"

RESPONSE PATTERN (pick ONE):
1. Reflect briefly, then ask: "What specifically about [their concern] worries you?"
2. Ask: "Where in your work do you see this showing up?"
3. Ask: "What would change if you decided to use AI for this?"
4. Ask: "How does that connect to what you just saw in the example?"

NEVER:
- Ask more than one question
- Explain modes or concepts—let them discover
- Say "that's a good point" or over-validate
- Pretend to know what they watched if they clarify

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
